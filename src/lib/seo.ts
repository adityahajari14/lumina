export const SITE_URL = 'https://www.luminablackoutblinds.com';
export const POLICY_PATHS = ['/privacy-policy', '/returns-refunds-policy', '/shipping-policy', '/terms-of-service'];
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
