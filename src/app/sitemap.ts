import type { MetadataRoute } from 'next';
import { SITE_URL, POLICY_PATHS } from '@/lib/seo';
import { BLACKOUT_PRODUCT_PATH } from '@/lib/product-routes';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', BLACKOUT_PRODUCT_PATH, ...POLICY_PATHS].map(path => ({ url: `${SITE_URL}${path}` }));
}
