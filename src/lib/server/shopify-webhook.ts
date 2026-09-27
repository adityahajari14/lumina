import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyShopifyWebhook(body: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac('sha256', secret).update(body, 'utf8').digest();
  const received = Buffer.from(signature, 'base64');
  return received.length === expected.length && timingSafeEqual(expected, received);
}
