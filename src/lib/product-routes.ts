export const BLACKOUT_PRODUCT_HANDLE = "non-driii-honeycomb-blackout-blinds";

export function getProductPath(slug: string) {
  return `/products/${slug}`;
}

export const BLACKOUT_PRODUCT_PATH = getProductPath(BLACKOUT_PRODUCT_HANDLE);
