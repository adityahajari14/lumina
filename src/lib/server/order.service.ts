import { calculateProductPrice, resolveHandleToPriceBand, getPriceBandMatrix, type PricingRequest } from './pricing.service';
import { getAdminApiUrl, getAdminHeaders, validateShopifyConfig } from './shopify-admin';
import { getCachedProduct } from './product-cache';
import { BLIND_COLOR_OPTIONS, FRAME_COLOR_OPTIONS, OPENING_DIRECTION_OPTIONS } from '@/data/customizations';
import { BLACKOUT_PRODUCT_HANDLE } from '@/lib/product-routes';
import { randomUUID } from 'node:crypto';
import { normalizeDraftOrderId, isPaidFinancialStatus } from '@/lib/shopify-order-id';
import { markAbandonedCartCheckoutStarted } from './abandoned-cart.service';
import { recordCheckoutStarted } from './abandoned-checkout.service';

// ============================================
// Types
// ============================================

export interface CheckoutItemRequest {
  handle: string;
  widthInches: number;
  heightInches: number;
  quantity: number;
  submittedPrice: number;
  configuration: {
    roomType?: string;
    blindName?: string;
    headrail?: string;
    headrailColour?: string;
    installationMethod?: string;
    controlOption?: string;
    stacking?: string;
    controlSide?: string;
    bottomChain?: string;
    bracketType?: string;
    chainColor?: string;
    wrappedCassette?: string;
    cassetteMatchingBar?: string;
    motorization?: string;
    blindColor?: string;
    frameColor?: string;
    openingDirection?: string;
    bottomBar?: string;
    rollStyle?: string;
    [key: string]: string | undefined;
  };
}

export interface CreateCheckoutRequest {
  items: CheckoutItemRequest[];
  customerEmail?: string;
  note?: string;
  sessionId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  deviceType?: string;
  userAgent?: string;
  sessionDurationSeconds?: number;
}

export interface CreateCheckoutResponse {
  checkoutUrl: string;
  draftOrderId: string;
  lineItems: {
    handle: string;
    title: string;
    calculatedPrice: number;
    quantity: number;
  }[];
  subtotal: number;
}

interface AbandonedCheckoutLineItem {
  handle: string;
  title: string;
  quantity: number;
  calculatedPrice: number;
  widthInches: number;
  heightInches: number;
  configuration: CheckoutItemRequest['configuration'];
}

interface ShopifyDraftOrderLineItem {
  quantity: number;
  customAttributes: { key: string; value: string }[];
  variantId?: string;
  priceOverride?: { amount: string; currencyCode: string };
  title?: string;
  originalUnitPriceWithCurrency?: { amount: string; currencyCode: string };
}

const variantIdByHandleCache = new Map<string, number | null>();
const DRAFT_ORDER_CURRENCY = 'USD';

// ============================================
// Helper Functions
// ============================================

function configToCustomizations(config: CheckoutItemRequest['configuration']): PricingRequest['customizations'] {
  const customizations: { category: string; optionId: string }[] = [];

  const mappings: Record<string, string> = {
    headrail: 'headrail',
    headrailColour: 'headrail-colour',
    installationMethod: 'installation-method',
    controlOption: 'control-option',
    stacking: 'stacking',
    controlSide: 'control-side',
    bottomChain: 'bottom-chain',
    bracketType: 'bracket-type',
    chainColor: 'chain-color',
    wrappedCassette: 'wrapped-cassette',
    cassetteMatchingBar: 'cassette-bar',
    motorization: 'motorization',
    blindColor: 'blind-color',
    frameColor: 'frame-color',
    openingDirection: 'opening-direction',
    bottomBar: 'bottom-bar',
    rollStyle: 'roll-style',
  };

  for (const [configKey, category] of Object.entries(mappings)) {
    const value = config[configKey];
    if (value && value !== 'none') {
      customizations.push({ category, optionId: value });
    }
  }

  return customizations;
}

function buildLineItemProperties(
  item: CheckoutItemRequest,
  calculatedPrice: number
): { key: string; value: string }[] {
  const properties: { key: string; value: string }[] = [];

  properties.push({ key: 'Width', value: `${item.widthInches} inches` });
  properties.push({ key: 'Height', value: `${item.heightInches} inches` });

  if (item.configuration.roomType) {
    properties.push({ key: 'Room Type', value: item.configuration.roomType });
  }
  if (item.configuration.blindName) {
    properties.push({ key: 'Blind Name', value: item.configuration.blindName });
  }

  const labelMap: Record<string, string> = {
    headrail: 'Headrail',
    headrailColour: 'Headrail Colour',
    installationMethod: 'Installation',
    controlOption: 'Control Option',
    stacking: 'Stacking',
    controlSide: 'Control Side',
    bottomChain: 'Bottom Chain',
    bracketType: 'Bracket Type',
    chainColor: 'Chain Color',
    wrappedCassette: 'Wrapped Cassette',
    cassetteMatchingBar: 'Cassette Bar',
    motorization: 'Motorization',
    blindColor: 'Blind Color',
    frameColor: 'Frame Color',
    openingDirection: 'Opening Direction',
    bottomBar: 'Bottom Bar',
    rollStyle: 'Roll Style',
  };

  for (const [key, label] of Object.entries(labelMap)) {
    const value = item.configuration[key];
    if (value && value !== 'none') {
      properties.push({ key: label, value });
    }
  }

  properties.push({ key: '_calculatedPrice', value: calculatedPrice.toFixed(2) });

  return properties;
}

async function getPrimaryVariantIdByHandle(handle: string): Promise<number | null> {
  const cached = variantIdByHandleCache.get(handle);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const url = getAdminApiUrl(`/products.json?handle=${encodeURIComponent(handle)}&fields=variants`);
    const response = await fetch(url, {
      headers: getAdminHeaders(),
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      throw new CheckoutError('Unable to load the product. Please try again.', 503);
    }

    const data = (await response.json()) as {
      products?: Array<{ variants?: Array<{ id?: number | string }> }>;
    };
    const rawId = data.products?.[0]?.variants?.[0]?.id;
    const parsed =
      typeof rawId === 'number'
        ? rawId
        : typeof rawId === 'string'
          ? Number(rawId)
          : NaN;

    const variantId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    if (!variantId) throw new CheckoutError('This product is currently unavailable. Please try again later.', 503);
    variantIdByHandleCache.set(handle, variantId);
    return variantId;
  } catch (error) {
    console.error(`[OrderService] Failed variant lookup for handle "${handle}":`, error);
    throw new CheckoutError('Unable to load the product. Please try again.', 503);
  }
}

const PRICE_TOLERANCE = 0.50;
const REQUIRED_BLACKOUT_CONFIG_FIELDS = ['blindColor', 'frameColor', 'openingDirection'] as const;

// ============================================
// Service Functions
// ============================================

export class CheckoutError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'CheckoutError';
    this.statusCode = statusCode;
  }
}

export async function createCheckout(request: CreateCheckoutRequest): Promise<CreateCheckoutResponse> {
  validateShopifyConfig();

  if (!Array.isArray(request.items) || request.items.length === 0 || request.items.length > 100) {
    throw new CheckoutError('Cart is empty', 400);
  }

  const lineItems: ShopifyDraftOrderLineItem[] = [];
  const responseLineItems: CreateCheckoutResponse['lineItems'] = [];
  const abandonedCheckoutItems: AbandonedCheckoutLineItem[] = [];
  let subtotal = 0;

  for (const item of request.items) {
    if (!item || typeof item.handle !== 'string' || !item.handle) {
      throw new CheckoutError('Each item must have a handle', 400);
    }
    if (!Number.isFinite(item.widthInches) || item.widthInches <= 0) {
      throw new CheckoutError('Each item must have a positive widthInches', 400);
    }
    if (!Number.isFinite(item.heightInches) || item.heightInches <= 0) {
      throw new CheckoutError('Each item must have a positive heightInches', 400);
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
      throw new CheckoutError('Each item must have a quantity >= 1', 400);
    }
    if (typeof item.submittedPrice !== 'number' || !Number.isFinite(item.submittedPrice) || item.submittedPrice < 0) {
      throw new CheckoutError('Each item must have a valid submittedPrice', 400);
    }
    if (!item.configuration || typeof item.configuration !== 'object' || Array.isArray(item.configuration)) {
      throw new CheckoutError('Each item must include a configuration object', 400);
    }

    if (Object.values(item.configuration).some(value => value !== undefined && (typeof value !== 'string' || value.length > 200))) {
      throw new CheckoutError('Invalid configuration value', 400);
    }

    if (item.handle === BLACKOUT_PRODUCT_HANDLE) {
      for (const field of REQUIRED_BLACKOUT_CONFIG_FIELDS) {
        if (!item.configuration[field]) {
          throw new CheckoutError(`Missing required configuration: ${field}`, 400);
        }
      }
    }

    const cachedProduct = await getCachedProduct(item.handle);
    if (!cachedProduct) {
      throw new CheckoutError(`Product not found: ${item.handle}`, 404);
    }

    if (item.handle === BLACKOUT_PRODUCT_HANDLE) {
      const allowed = { blindColor: BLIND_COLOR_OPTIONS, frameColor: FRAME_COLOR_OPTIONS, openingDirection: OPENING_DIRECTION_OPTIONS };
      for (const field of REQUIRED_BLACKOUT_CONFIG_FIELDS) {
        if (!allowed[field].some(option => option.id === item.configuration[field])) {
          throw new CheckoutError(`Invalid configuration: ${field}`, 400);
        }
      }
    }
    const band = await resolveHandleToPriceBand(item.handle);
    const matrix = band ? await getPriceBandMatrix(band.id) : null;
    if (!matrix?.widthBands.length || !matrix.heightBands.length) throw new CheckoutError('Pricing unavailable. Please try again.', 503);
    const widths = matrix.widthBands.map(band => band.inches);
    const heights = matrix.heightBands.map(band => band.inches);
    if (item.widthInches < Math.min(...widths) || item.widthInches > Math.max(...widths) ||
        item.heightInches < Math.min(...heights) || item.heightInches > Math.max(...heights)) {
      throw new CheckoutError('The selected dimensions are outside the supported size range. Please edit this item.', 422);
    }
    const productTitle = item.configuration.blindName?.trim() || cachedProduct.title;
    const customizations = configToCustomizations(item.configuration);

    const pricing = await calculateProductPrice({
      handle: item.handle,
      widthInches: item.widthInches,
      heightInches: item.heightInches,
      customizations,
    });

    const priceDifference = Math.abs(pricing.totalPrice - item.submittedPrice);
    if (priceDifference > PRICE_TOLERANCE) {
      throw new CheckoutError(
        `Price mismatch for "${productTitle}": submitted $${item.submittedPrice.toFixed(2)}, ` +
        `calculated $${pricing.totalPrice.toFixed(2)} (diff: $${priceDifference.toFixed(2)})`,
        422
      );
    }

    const itemPrice = pricing.totalPrice;
    const lineItemTitle = `${productTitle} – ${item.widthInches}" × ${item.heightInches}"`;

    const variantId = await getPrimaryVariantIdByHandle(item.handle);
    const customAttributes = buildLineItemProperties(item, itemPrice);

    if (variantId) {
      lineItems.push({
        variantId: `gid://shopify/ProductVariant/${variantId}`,
        priceOverride: {
          amount: itemPrice.toFixed(2),
          currencyCode: DRAFT_ORDER_CURRENCY,
        },
        quantity: item.quantity,
        customAttributes,
      });
    } else {
      lineItems.push({
        title: lineItemTitle,
        quantity: item.quantity,
        originalUnitPriceWithCurrency: {
          amount: itemPrice.toFixed(2),
          currencyCode: DRAFT_ORDER_CURRENCY,
        },
        customAttributes,
      });
    }

    responseLineItems.push({
      handle: item.handle,
      title: lineItemTitle,
      calculatedPrice: itemPrice,
      quantity: item.quantity,
    });

    abandonedCheckoutItems.push({
      handle: item.handle,
      title: lineItemTitle,
      quantity: item.quantity,
      calculatedPrice: itemPrice,
      widthInches: item.widthInches,
      heightInches: item.heightInches,
      configuration: item.configuration,
    });

    subtotal += itemPrice * item.quantity;
  }

  const checkoutKey = randomUUID();
  const mutation = `
    mutation DraftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          invoiceUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await fetch(getAdminApiUrl('/graphql.json'), {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          lineItems,
          customAttributes: [{ key: '_lumina_checkout_id', value: checkoutKey }],
          useCustomerDefaultAddress: false,
          note: request.note || '',
          allowDiscountCodesInCheckout: true,
          acceptAutomaticDiscounts: true,
          ...(request.customerEmail && { email: request.customerEmail }),
          presentmentCurrencyCode: DRAFT_ORDER_CURRENCY,
        },
      },
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(25_000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    if (response.status === 401) {
      throw new CheckoutError('Shopify authentication failed. Check SHOPIFY_ADMIN_ACCESS_TOKEN.', 500);
    }
    if (response.status === 429) {
      throw new CheckoutError('Shopify rate limit exceeded. Please try again in a moment.', 429);
    }
    throw new CheckoutError(`Failed to create checkout: ${errorBody}`, 500);
  }

  const data = await response.json() as {
    data?: {
      draftOrderCreate?: {
        draftOrder?: { id: string; invoiceUrl: string | null } | null;
        userErrors?: Array<{ field?: string[] | null; message: string }>;
      };
    };
    errors?: Array<{ message: string }>;
  };

  if (data.errors?.length) {
    throw new CheckoutError(`Failed to create checkout: ${data.errors[0]?.message || 'Unknown GraphQL error'}`, 500);
  }

  const draftOrderCreate = data.data?.draftOrderCreate;
  const userErrors = draftOrderCreate?.userErrors || [];
  if (userErrors.length > 0) {
    const message = userErrors.map((error) => error.message).join('; ');
    throw new CheckoutError(`Shopify rejected the draft order: ${message}`, 422);
  }

  const draftOrder = draftOrderCreate?.draftOrder;
  if (!draftOrder || !draftOrder.invoiceUrl) {
    throw new CheckoutError('Failed to create Shopify draft order: no invoice URL returned', 500);
  }

  try {
    await recordCheckoutStarted({
      checkoutKey,
      customerEmail: request.customerEmail,
      sessionId: request.sessionId,
      draftOrderId: draftOrder.id.toString(),
      checkoutUrl: draftOrder.invoiceUrl,
      subtotal,
      items: abandonedCheckoutItems,
      utmSource: request.utmSource,
      utmMedium: request.utmMedium,
      utmCampaign: request.utmCampaign,
      utmContent: request.utmContent,
      utmTerm: request.utmTerm,
      referrer: request.referrer,
      deviceType: request.deviceType,
      userAgent: request.userAgent,
      sessionDurationSeconds: request.sessionDurationSeconds,
    });
    if (request.sessionId) await markAbandonedCartCheckoutStarted(request.sessionId);
  } catch (error) {
    console.error('[OrderService] Failed to record abandoned-checkout snapshot:', error);
  }

  return {
    checkoutUrl: draftOrder.invoiceUrl,
    draftOrderId: draftOrder.id.toString(),
    lineItems: responseLineItems,
    subtotal,
  };
}

export async function getDraftOrderStatus(draftOrderId: string): Promise<{
  id: string;
  status: string;
  orderId: string | null;
  purchased: boolean;
  orderName: string | null;
  invoiceUrl: string;
  totalPrice: string;
  createdAt: string;
}> {
  validateShopifyConfig();

  let numericId: string;
  try { numericId = normalizeDraftOrderId(draftOrderId); } catch { throw new CheckoutError('Invalid draft order ID', 400); }
  const url = getAdminApiUrl(`/draft_orders/${numericId}.json`);
  const response = await fetch(url, {
    headers: getAdminHeaders(),
    cache: 'no-store',
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new CheckoutError('Draft order not found', 404);
    }
    throw new CheckoutError(`Failed to get draft order status: ${response.statusText}`, 500);
  }

  const data = await response.json();
  const draftOrder = data.draft_order;
  const orderId =
    typeof draftOrder.order_id === 'string' || typeof draftOrder.order_id === 'number'
      ? String(draftOrder.order_id)
      : typeof draftOrder.order_id?.id === 'string' || typeof draftOrder.order_id?.id === 'number'
        ? String(draftOrder.order_id.id)
        : null;

  let purchased = false;
  if (orderId) {
    if (!/^[1-9]\d*$/.test(orderId)) throw new CheckoutError('Invalid order response', 502);
    const orderResponse = await fetch(getAdminApiUrl(`/orders/${orderId}.json?fields=id,financial_status`), {
      headers: getAdminHeaders(), cache: 'no-store', signal: AbortSignal.timeout(12_000),
    });
    if (!orderResponse.ok) throw new CheckoutError('Unable to verify payment status', 503);
    const orderData = await orderResponse.json();
    purchased = isPaidFinancialStatus(orderData.order?.financial_status);
  }

  return {
    purchased,
    id: draftOrder.id.toString(),
    status: draftOrder.status,
    orderId,
    orderName: draftOrder.name || null,
    invoiceUrl: draftOrder.invoice_url,
    totalPrice: draftOrder.total_price,
    createdAt: draftOrder.created_at,
  };
}
