// Shopify product handle — also the public URL slug, since both now match.
// Used to fetch the product, resolve pricing bands, match cart line items at
// checkout, and build the product page URL.
export const BLACKOUT_PRODUCT_HANDLE = "honeycomb-blackout-blind";

export const MEASURING_GUIDE_PATH = "/guide/lumina-measuring-guide.png";
export const FITTING_GUIDE_PATH = "/guide/lumina_honeycomb_fitting_guide.pdf";

export function getProductPath(slug: string) {
  return `/products/${slug}`;
}

export const BLACKOUT_PRODUCT_PATH = getProductPath(BLACKOUT_PRODUCT_HANDLE);
