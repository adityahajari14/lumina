/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHmac } = require('node:crypto');
const { stub } = require('./register.cjs');
const queries = [];
const rows = [{ id: '1', draft_order_id: 'late', status: 'abandoned', created_at: '2020-01-01' }, { id: '2', draft_order_id: 'error', status: 'pending', created_at: '2020-01-01' }, { id: '3', draft_order_id: 'unpaid', status: 'pending', created_at: '2020-01-01' }];
stub('@/lib/server/db', { ensureSchema: async () => {}, sql: () => ({ query: async (query, args) => { queries.push({ query, args }); return query.includes('SELECT *') ? rows : []; } }) });
stub('@/lib/server/order.service', { getDraftOrderStatus: async id => { if (id === 'error') throw new Error('network unavailable'); return { orderId: id === 'late' ? '456' : null, purchased: id === 'late' }; } });
const { reconcilePendingCheckouts } = require('../src/lib/server/abandoned-checkout.service');
const { verifyShopifyWebhook } = require('../src/lib/server/shopify-webhook');

test('late payments reconcile; failed lookups never become abandoned', async () => {
  const result = await reconcilePendingCheckouts();
  assert.equal(result.converted, 1);
  assert.equal(result.abandoned, 1);
  assert.ok(queries[0].query.includes("('pending', 'abandoned')"));
  assert.ok(!queries.some(({ query, args }) => query.includes("status = 'abandoned'") && args[0] === '2'));
});
test('webhook HMAC verifies the exact raw body and rejects tampering', () => {
  const raw = '{"id":456}';
  const signature = createHmac('sha256', 'test-secret').update(raw).digest('base64');
  assert.equal(verifyShopifyWebhook(raw, signature, 'test-secret'), true);
  assert.equal(verifyShopifyWebhook(raw + ' ', signature, 'test-secret'), false);
  for (const bad of [null, '', 'invalid', signature]) assert.equal(verifyShopifyWebhook(raw, bad, 'wrong-secret'), false);
});
test('paid webhook rejects unauthorized calls and persists signed deliveries idempotently', async () => {
  const { POST } = require('../src/app/api/webhooks/shopify/orders-paid/route');
  process.env.SHOPIFY_WEBHOOK_SECRET = 'test-secret';
  const raw = JSON.stringify({ id: 456, note_attributes: [{ name: '_lumina_checkout_id', value: 'test-checkout' }] });
  const call = signature => POST(new Request('https://shop.test/api/webhooks/shopify/orders-paid', { method: 'POST', body: raw, headers: { 'x-shopify-topic': 'orders/paid', 'x-shopify-hmac-sha256': signature } }));
  assert.equal((await call('bad')).status, 401);
  const signature = createHmac('sha256', 'test-secret').update(raw).digest('base64');
  assert.equal((await call(signature)).status, 200);
  const last = queries.at(-1);
  assert.ok(last.query.includes('ON CONFLICT (order_id)'));
  assert.deepEqual(last.args, ['456', 'test-checkout']);
  delete process.env.SHOPIFY_WEBHOOK_SECRET;
});
