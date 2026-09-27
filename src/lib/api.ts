import { fetchWithTimeout } from "./fetch-with-timeout";
import {
  CheckoutItemRequest,
  CheckoutResponse,
  CustomizationPricing,
  PriceBandMatrix,
  PriceValidationResponse,
  PricingRequest,
} from '@/types';
import type { StoreSessionContext } from '@/lib/store-events';

const SERVER_API_CACHE_REVALIDATE_SECONDS =
  Number(process.env.SERVER_API_CACHE_REVALIDATE_SECONDS || 3_600);

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fetchOptions: RequestInit = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const method = (fetchOptions.method || 'GET').toUpperCase();
  if (typeof window === 'undefined' && method === 'GET') {
    (fetchOptions as RequestInit & { next?: { revalidate: number } }).next = {
      revalidate: SERVER_API_CACHE_REVALIDATE_SECONDS,
    };
  }

  const response = await fetchWithTimeout(`${getApiBaseUrl()}${normalizedEndpoint}`, fetchOptions, normalizedEndpoint.includes("create-checkout") ? 45_000 : 12_000);

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message || 'Unable to complete this request. Please try again.');
  }

  return response.json();
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string };
}

export async function fetchPriceMatrix(handle: string): Promise<PriceBandMatrix> {
  const response = await apiFetch<ApiResponse<PriceBandMatrix>>(`/api/pricing/matrix/${handle}`);
  if (!response.success || !response.data?.widthBands?.length || !response.data?.heightBands?.length || !response.data?.prices?.length) {
    throw new Error('Pricing is temporarily unavailable. Please try again.');
  }
  return response.data;
}

export async function fetchCustomizationPricing(): Promise<CustomizationPricing[]> {
  const response = await apiFetch<ApiResponse<CustomizationPricing[]>>('/api/pricing/customizations');
  if (!response.success || !Array.isArray(response.data)) throw new Error('Options are temporarily unavailable. Please try again.');
  return response.data;
}

export async function validateCartPrice(
  request: PricingRequest,
  submittedPrice: number
): Promise<PriceValidationResponse> {
  const response = await apiFetch<ApiResponse<PriceValidationResponse>>('/api/pricing/validate', {
    method: 'POST',
    body: JSON.stringify({ ...request, submittedPrice }),
  });
  if (!response.success || !Number.isFinite(response.data?.calculatedPrice) || response.data.calculatedPrice <= 0) throw new Error('Unable to confirm this price. Please try again.');
  return response.data;
}

export async function createCheckout(
  items: CheckoutItemRequest[],
  customerEmail?: string,
  session?: StoreSessionContext | null
): Promise<CheckoutResponse> {
  const response = await apiFetch<ApiResponse<CheckoutResponse>>('/api/orders/create-checkout', {
    method: 'POST',
    body: JSON.stringify({
      items,
      customerEmail,
      sessionId: session?.sessionId,
      utmSource: session?.utmSource,
      utmMedium: session?.utmMedium,
      utmCampaign: session?.utmCampaign,
      utmContent: session?.utmContent,
      utmTerm: session?.utmTerm,
      referrer: session?.referrer,
      deviceType: session?.deviceType,
      userAgent: session?.userAgent,
      sessionDurationSeconds: session?.sessionDurationSeconds,
    }),
  });

  if (!response.success || !response.data?.draftOrderId || !response.data?.checkoutUrl || !Number.isFinite(response.data?.subtotal)) {
    throw new Error(response.error?.message || 'Failed to create checkout');
  }

  return response.data;
}

export function formatPrice(price: number): number {
  return Math.round(price * 100) / 100;
}

export function getCurrencySymbol(code: string): string {
  const symbols: Record<string, string> = {
    GBP: '£',
    EUR: '€',
    USD: '$',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
  };
  return symbols[code.toUpperCase()] || code;
}

export function formatPriceWithCurrency(price: number, currency: string = 'USD'): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = formatPrice(price);
  return `${symbol}${formatted.toFixed(2)}`;
}
