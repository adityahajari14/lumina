/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { stub } = require('./register.cjs');
const events = [];
const carts = [];
stub('@/lib/server/events.service', {
  STOREFRONT_EVENT_TYPES: ['product_view', 'add_to_cart', 'cart_view', 'cart_updated', 'checkout_attempt', 'checkout_initiated', 'checkout_error'],
  recordStorefrontEvent: async input => events.push(input),
});
stub('@/lib/server/abandoned-cart.service', {
  upsertAbandonedCart: async input => carts.push(input),
  markAbandonedCartCheckoutStarted: async () => { throw new Error('Browser events must not change server checkout status'); },
});
const { POST } = require('../src/app/api/track/route');
const post = body => POST(new Request('https://shop.test/api/track', { method: 'POST', body: JSON.stringify({ sessionId: 'test-session', ...body }) }));

test('add-to-cart snapshots use the complete cart total, not the newly added item value', async () => {
  const response = await post({ eventType: 'add_to_cart', value: 20, meta: { items: [{ handle: 'a', quantity: 2, price: 30 }, { handle: 'b', quantity: 1, price: 20 }] } });
  assert.equal(response.status, 200);
  assert.equal(events.at(-1).value, 20);
  assert.equal(carts.at(-1).subtotal, 80);
  assert.equal(carts.at(-1).items.length, 2);
});
test('an emptied cart is recorded; a browser checkout event cannot claim a conversion', async () => {
  assert.equal((await post({ eventType: 'cart_updated', value: 0, meta: { items: [] } })).status, 200);
  assert.equal(carts.at(-1).subtotal, 0);
  assert.deepEqual(carts.at(-1).items, []);
  const count = carts.length;
  for (const eventType of ['checkout_attempt', 'checkout_error', 'checkout_initiated']) assert.equal((await post({ eventType })).status, 200);
  assert.equal(carts.length, count);
});
