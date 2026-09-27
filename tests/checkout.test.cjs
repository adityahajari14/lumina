/* eslint-disable @typescript-eslint/no-require-imports */
const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { stub } = require('./register.cjs');
const { normalizeDraftOrderId, isPaidFinancialStatus } = require('../src/lib/shopify-order-id');
const originalFetch = global.fetch;
stub('@/lib/server/shopify-admin', { validateShopifyConfig() {}, getAdminApiUrl: path => `https://shop.test/admin/api/test${path}`, getAdminHeaders: () => ({}) });
stub('@/lib/server/product-cache', { getCachedProduct: async () => ({ title: 'Blind' }) });
stub('@/lib/server/pricing.service', { calculateProductPrice: async () => ({ totalPrice: 205.71 }), resolveHandleToPriceBand: async () => ({ id: 'band' }), getPriceBandMatrix: async () => ({ widthBands: [{ inches: 10 }, { inches: 138 }], heightBands: [{ inches: 10 }, { inches: 79 }] }) });
stub('@/lib/server/abandoned-checkout.service', { recordCheckoutStarted: async () => {} });
stub('@/lib/server/abandoned-cart.service', { markAbandonedCartCheckoutStarted: async () => {} });
const { getDraftOrderStatus, createCheckout } = require('../src/lib/server/order.service');
const { fetchWithTimeout } = require('../src/lib/fetch-with-timeout');
afterEach(() => { global.fetch = originalFetch; });
const item = { handle: 'honeycomb-blackout-blind', widthInches: 30, heightInches: 40, quantity: 1, submittedPrice: 205.71, configuration: { blindColor: 'white', frameColor: 'white', openingDirection: 'left-right' } };

test('numeric and GraphQL draft IDs normalize; malformed IDs are rejected', () => {
  assert.equal(normalizeDraftOrderId('gid://shopify/DraftOrder/123'), '123');
  assert.equal(normalizeDraftOrderId('123'), '123');
  for (const bad of ['0', '../orders', 'gid://shopify/Order/123', '12?fields=id']) assert.throws(() => normalizeDraftOrderId(bad));
});
test('an order existing, authorized, or partly paid is not a paid purchase', async () => {
  for (const financialStatus of ['pending', 'authorized', 'partially_paid', 'voided', 'paid', 'partially_refunded', 'refunded']) {
    const urls = [];
    global.fetch = async url => {
      urls.push(url);
      return Response.json(url.includes('/draft_orders/') ? { draft_order: { id: 123, status: 'completed', order_id: 456 } } : { order: { id: 456, financial_status: financialStatus } });
    };
    const status = await getDraftOrderStatus('gid://shopify/DraftOrder/123');
    assert.equal(status.purchased, isPaidFinancialStatus(financialStatus));
    assert.ok(urls[0].endsWith('/draft_orders/123.json'));
    assert.ok(urls[1].endsWith('/orders/456.json?fields=id,financial_status'));
  }
});
test('a failed payment lookup stays unknown instead of clearing the cart', async () => {
  global.fetch = async url => url.includes('/draft_orders/') ? Response.json({ draft_order: { id: 123, order_id: 456 } }) : new Response('', { status: 403 });
  await assert.rejects(getDraftOrderStatus('123'), /verify payment/);
});
test('invalid sizes, quantities and options cannot create Shopify drafts', async () => {
  global.fetch = () => { throw new Error('Must not reach Shopify'); };
  for (const change of [{ widthInches: Infinity }, { quantity: 1.2 }, { quantity: 101 }, { widthInches: 139 }, { heightInches: 9 }, { configuration: { ...item.configuration, openingDirection: 'made-up' } }]) {
    await assert.rejects(createCheckout({ items: [{ ...item, ...change }] }), error => error.statusCode === 400 || error.statusCode === 422);
  }
});
test('transient variant errors do not become custom line items or poisoned cache entries', async () => {
  let lookups = 0;
  let drafts = 0;
  global.fetch = async (url, init) => {
    if (url.includes('/products.json')) { lookups++; return lookups === 1 ? new Response('', { status: 503 }) : Response.json({ products: [{ variants: [{ id: 789 }] }] }); }
    drafts++;
    const payload = JSON.parse(init.body);
    assert.equal(payload.variables.input.lineItems[0].variantId, 'gid://shopify/ProductVariant/789');
    assert.equal(payload.variables.input.customAttributes[0].key, '_lumina_checkout_id');
    return Response.json({ data: { draftOrderCreate: { draftOrder: { id: 'gid://shopify/DraftOrder/123', invoiceUrl: 'https://shop.test/invoice' }, userErrors: [] } } });
  };
  await assert.rejects(createCheckout({ items: [item] }), /try again/);
  assert.equal(drafts, 0);
  assert.equal((await createCheckout({ items: [item] })).subtotal, 205.71);
  assert.equal(lookups, 2);
  assert.equal(drafts, 1);
});
test('a stalled request aborts with a retryable error', async () => {
  global.fetch = (_url, init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(new Error('aborted'))));
  await assert.rejects(fetchWithTimeout('/stalled', {}, 10), /timed out/);
});
