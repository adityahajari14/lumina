import type { ApiProduct, Product, ProductAccordionItem, ProductFeatures } from '@/types';
import { fetchShopifyProductByHandleMerged } from '@/lib/shopify';

export const BLACKOUT_PRODUCT_HANDLE = 'non-driii-honeycomb-blackout-blinds';

const BLACKOUT_PRODUCT_FEATURES: ProductFeatures = {
  hasSize: true,
  hasHeadrail: false,
  hasHeadrailColour: false,
  hasInstallationMethod: false,
  hasControlOption: false,
  hasStacking: false,
  hasControlSide: false,
  hasBottomChain: false,
  hasBracketType: false,
  hasChainColor: false,
  hasWrappedCassette: false,
  hasCassetteMatchingBar: false,
  hasMotorization: false,
  hasBlindColor: true,
  hasFrameColor: true,
  hasOpeningDirection: true,
  hasBottomBar: false,
  hasRollStyle: false,
  hasPvcFabric: false,
  hasRollerCassette: false,
};

function buildSpecificationsHtml(apiProduct: ApiProduct): string | null {
  const items = [
    apiProduct.productType ? `<li><strong>Product type:</strong> ${apiProduct.productType}</li>` : null,
    apiProduct.vendor ? `<li><strong>Vendor:</strong> ${apiProduct.vendor}</li>` : null,
    apiProduct.categories[0]?.name ? `<li><strong>Collection:</strong> ${apiProduct.categories[0].name}</li>` : null,
    apiProduct.tags.length > 0 ? `<li><strong>Tags:</strong> ${apiProduct.tags.map((tag) => tag.name).join(', ')}</li>` : null,
  ].filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return `<ul>${items.join('')}</ul>`;
}

function buildAccordionItems(apiProduct: ApiProduct): ProductAccordionItem[] {
  const items: ProductAccordionItem[] = [];

  if (apiProduct.productDetails || apiProduct.descriptionHtml || apiProduct.description) {
    items.push({
      title: 'Product Details',
      content: apiProduct.description || apiProduct.title,
      contentHtml:
        apiProduct.productDetails ||
        apiProduct.descriptionHtml ||
        apiProduct.description ||
        apiProduct.title,
    });
  }

  const specificationsHtml = apiProduct.specifications || buildSpecificationsHtml(apiProduct);
  if (specificationsHtml) {
    items.push({
      title: 'Specifications',
      content: 'Product specifications',
      contentHtml: specificationsHtml,
    });
  }

  if (apiProduct.measuringInstallation) {
    items.push({
      title: 'Measuring & Installation',
      content: apiProduct.measuringInstallation,
      contentHtml: apiProduct.measuringInstallation,
    });
  }

  if (apiProduct.deliveryReturns || apiProduct.estimatedDelivery) {
    const deliveryContent =
      apiProduct.deliveryReturns ||
      `<p><strong>Estimated delivery:</strong> ${apiProduct.estimatedDelivery}</p>`;

    items.push({
      title: 'Delivery & Returns',
      content: apiProduct.deliveryReturns || apiProduct.estimatedDelivery || '',
      contentHtml: deliveryContent,
    });
  }

  return items;
}

function buildFallbackProduct(): Product {
  return {
    id: BLACKOUT_PRODUCT_HANDLE,
    name: 'Blackout Blind',
    slug: BLACKOUT_PRODUCT_HANDLE,
    category: 'Blackout Blinds',
    tags: ['blackout', 'honeycomb'],
    price: 0,
    currency: 'USD',
    rating: null,
    reviewCount: null,
    estimatedDelivery: null,
    description: 'Blackout blind',
    descriptionHtml: 'Blackout blind',
    images: ['/product/gallery-1.webp'],
    imageAlts: ['Blackout blind'],
    videos: [],
    vendor: null,
    productType: 'Blinds',
    features: BLACKOUT_PRODUCT_FEATURES,
    accordionItems: [
      {
        title: 'Product Details',
        content: 'Blackout blind',
        contentHtml: '<p>Blackout blind</p>',
      },
    ],
    reviews: [],
    relatedProducts: [],
  };
}

export async function getBlackoutProduct(): Promise<Product> {
  const fallback = buildFallbackProduct();

  try {
    const apiProduct = await fetchShopifyProductByHandleMerged(BLACKOUT_PRODUCT_HANDLE);
    if (!apiProduct) return fallback;

    return {
      id: apiProduct.id,
      name: apiProduct.title,
      slug: apiProduct.slug,
      category: apiProduct.categories[0]?.name || apiProduct.productType || fallback.category,
      tags: apiProduct.tags.map((tag) => tag.name),
      price: typeof apiProduct.price === 'string' ? parseFloat(apiProduct.price) : apiProduct.price,
      currency: 'USD',
      rating: apiProduct.rating ?? null,
      reviewCount: apiProduct.reviewCount ?? null,
      estimatedDelivery: apiProduct.estimatedDelivery || null,
      description: apiProduct.subtitle || apiProduct.description || apiProduct.title,
      descriptionHtml: apiProduct.descriptionHtml || apiProduct.description || apiProduct.title,
      images: apiProduct.images.length > 0 ? apiProduct.images : fallback.images,
      imageAlts:
        apiProduct.imageAlts.length > 0
          ? apiProduct.imageAlts.map(
              (alt, index) => alt || `${apiProduct.title} image ${index + 1}`
            )
          : fallback.imageAlts,
      videos: apiProduct.videos || [],
      vendor: apiProduct.vendor || null,
      productType: apiProduct.productType || null,
      features: BLACKOUT_PRODUCT_FEATURES,
      accordionItems: buildAccordionItems(apiProduct),
      reviews: [],
      relatedProducts: [],
    };
  } catch {
    return fallback;
  }
}
