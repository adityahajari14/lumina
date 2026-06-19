import type { Product, ProductAccordionItem, ProductFeatures } from '@/types';
import { fetchShopifyProductByHandleMerged } from '@/lib/shopify';
import { BLACKOUT_PRODUCT_HANDLE, MEASURING_GUIDE_PATH, FITTING_GUIDE_PATH } from '@/lib/product-routes';

export { BLACKOUT_PRODUCT_HANDLE };

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


function buildAccordionItems(): ProductAccordionItem[] {
  return [
    {
      title: 'Details',
      content: 'Triple-layer blackout fabric. No-drill tension bar installation. Custom cut to size.',
      contentHtml: `<ul>
        <li><strong>Fabric:</strong> Triple-layer blackout — certified 100% light block</li>
        <li><strong>Installation:</strong> No-drill spring tension bar — no fixings, no damage</li>
        <li><strong>Sizing:</strong> Made to order from 20 cm up to 250 cm wide, 30 cm to 300 cm drop</li>
        <li><strong>Colors:</strong> White, Cream, Graphite, Sky Blue</li>
        <li><strong>Frame colors:</strong> White or Graphite</li>
        <li><strong>Opening direction:</strong> Left or right</li>
        <li><strong>Care:</strong> Spot clean with a damp cloth and mild soap — do not machine wash</li>
        <li><strong>Tolerance:</strong> +/− 4 mm manufacturing tolerance is standard for made-to-measure blinds</li>
      </ul>`,
    },
    {
      title: 'Window Compatibility',
      content: 'Designed for recessed windows with a recess depth of 5 mm to 80 mm.',
      contentHtml: `<p>The Lumina blackout blind is designed specifically for <strong>recessed windows</strong> — windows that sit inside a recess (reveal) rather than flush with the wall.</p>
      <ul>
        <li><strong>Minimum recess depth:</strong> 5 mm</li>
        <li><strong>Maximum recess depth:</strong> 80 mm</li>
        <li>The tension bar sits inside the recess, giving edge-to-edge coverage with no light bleed</li>
        <li>Not suitable for flat-wall mounting or non-recessed frames</li>
        <li>Works on uPVC, wood, and aluminium window frames</li>
      </ul>
      <p>If you're unsure whether your window is compatible, email us a photo at <strong>info@luminablackoutblinds.com</strong> and we'll confirm before you order.</p>`,
    },
    {
      title: 'How to measure',
      content: 'Measure the width and drop of your window recess to the nearest mm.',
      contentHtml: `<p>Measure the <strong>inside of your window recess</strong> — not the frame or the glass.</p>
      <ul>
        <li><strong>Width:</strong> Measure across the recess at the top, middle, and bottom. Use the <em>smallest</em> measurement.</li>
        <li><strong>Drop:</strong> Measure from the top of the recess to the window sill. Measure on the left, center, and right and use the <em>largest</em> measurement.</li>
        <li>Enter your exact dimensions at checkout — we cut every blind to order.</li>
        <li>A +/− 4 mm manufacturing tolerance is standard and does not affect blackout performance.</li>
      </ul>
      <p>Tip: measure twice before ordering. Because every blind is cut to your measurements, we're unable to accept returns on correctly made-to-measure items.</p>
      <p><a href="${MEASURING_GUIDE_PATH}" target="_blank" rel="noopener noreferrer">View full measuring guide →</a></p>`,
    },
    {
      title: 'How to install',
      content: 'No tools needed. Fit in under 60 seconds using the spring tension bar.',
      contentHtml: `<ol>
        <li>Unbox the blind and extend the tension bar to match your window width.</li>
        <li>Hold the bar horizontally inside the recess at your desired height.</li>
        <li>Press both ends firmly against the recess walls until the spring locks into position.</li>
        <li>Release — the tension holds the blind securely without any fixings or damage.</li>
        <li>Pull the blind down to your preferred drop. The cassette stays in place as you adjust.</li>
      </ol>
      <p>No drilling, no screws, no tools required. The blind can be removed and repositioned without leaving any marks — ideal for rentals.</p>
      <p><a href="${FITTING_GUIDE_PATH}" target="_blank" rel="noopener noreferrer">View full installation guide →</a></p>`,
    },
    {
      title: 'Shipping & Returns',
      content: 'Free USA shipping on every order. Delivered in 7–11 business days.',
      contentHtml: `<p><strong>Shipping</strong></p>
      <ul>
        <li>Free shipping on every order — no minimum spend</li>
        <li>Ships within the United States only</li>
        <li>Every blind is made to order and dispatched within 3–5 business days</li>
        <li>Estimated delivery: <strong>7–11 business days</strong> from order date</li>
        <li>A tracking number is emailed once your blind ships</li>
        <li>We are unable to deliver to PO boxes, military addresses, or international addresses</li>
      </ul>
      <p><strong>Returns</strong></p>
      <ul>
        <li>Because every blind is cut to your exact measurements, we do not accept returns on correctly made-to-measure items</li>
        <li>If your blind arrives damaged or has a confirmed manufacturing fault, contact us within <strong>3 business days</strong> of delivery</li>
        <li>Email <strong>info@luminablackoutblinds.com</strong> with your order number, a description, and photos</li>
        <li>Do not install the blind until we've reviewed your claim</li>
        <li>We aim to respond within 1 business day and will arrange a free replacement if a fault is confirmed</li>
      </ul>`,
    },
  ];
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
      accordionItems: buildAccordionItems(),
      reviews: [],
      relatedProducts: [],
    };
  } catch {
    return fallback;
  }
}
