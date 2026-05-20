export const BLACKOUT_PRODUCT_HANDLE = "non-driii-honeycomb-blackout-blinds";
export const MEASURING_GUIDE_PATH = "/guide/lumina-measuring-guide.png";
export const FITTING_GUIDE_PATH = "/guide/lumina_honeycomb_fitting_guide.pdf";

export function getProductPath(slug: string) {
  return `/products/${slug}`;
}

export const BLACKOUT_PRODUCT_PATH = getProductPath(BLACKOUT_PRODUCT_HANDLE);
