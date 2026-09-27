import { NextResponse } from 'next/server';
import { verifyShopifyWebhook } from '@/lib/server/shopify-webhook';
import { ensureSchema, sql } from '@/lib/server/db';

export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Webhook is not configured' }, { status: 503 });
  const raw = await request.text();
  if (!verifyShopifyWebhook(raw, request.headers.get('x-shopify-hmac-sha256'), secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  if (request.headers.get('x-shopify-topic') !== 'orders/paid') {
    return NextResponse.json({ error: 'Invalid topic' }, { status: 400 });
  }
  try {
    const order = JSON.parse(raw);
    const orderId = String(order?.id || '');
    if (!/^[1-9]\d*$/.test(orderId)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    const key = Array.isArray(order.note_attributes)
      ? order.note_attributes.find((attribute: { name?: string }) => attribute?.name === '_lumina_checkout_id')?.value
      : null;
    if (key && (typeof key !== 'string' || key.length > 100)) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
    await ensureSchema();
    // An idempotent state update: repeated deliveries never create another purchase.
    await sql().query(`WITH paid AS (
      INSERT INTO shopify_paid_orders (order_id, checkout_key) VALUES ($1, $2)
      ON CONFLICT (order_id) DO UPDATE SET checkout_key = COALESCE(shopify_paid_orders.checkout_key, EXCLUDED.checkout_key)
      RETURNING order_id, checkout_key
    ) UPDATE abandoned_checkouts
      SET status = 'converted', shopify_order_id = $1, payment_verified_at = COALESCE(payment_verified_at, now()), updated_at = now()
      WHERE shopify_order_id = (SELECT order_id FROM paid) OR (checkout_key IS NOT NULL AND checkout_key = (SELECT checkout_key FROM paid))`, [orderId, key || null]);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    console.error('[PaidWebhook] Persistence failed');
    // Non-2xx lets Shopify retry; never acknowledge an unpersisted event.
    return NextResponse.json({ error: 'Please retry delivery' }, { status: 503 });
  }
}
