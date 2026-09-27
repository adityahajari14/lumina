/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DEFAULT_CONFIGURATION } = require('../src/types');
const { restoreCart, removePurchasedItems, cartLineFingerprint } = require('../src/lib/cart-state');
const { serializeJsonLd } = require('../src/lib/seo');
const item = { id: 'line-1', quantity: 2, addedAt: new Date(), product: { id: 'product', slug: 'blind', name: 'Blind', images: ['/product.webp'], currency: 'USD', features: {}, price: 205.71 }, configuration: { ...DEFAULT_CONFIGURATION, width: 30, height: 40 } };

test('saved cart totals are recalculated; corrupt entries cannot break restoration', () => {
  const cart = restoreCart(JSON.stringify({ total: 1, items: [item, null, { ...item, quantity: -1 }, { ...item, product: { ...item.product, price: 'bad' } }] }));
  assert.equal(cart.items.length, 1);
  assert.equal(cart.total, 411.42);
  assert.equal(cart.itemCount, 2);
  assert.equal(restoreCart('{broken').items.length, 0);
});
test('payment removes only purchased quantities; new and edited lines survive', () => {
  const paid = [{ id: item.id, quantity: 2, fingerprint: cartLineFingerprint(item) }];
  const newItem = { ...item, id: 'new' };
  assert.deepEqual(removePurchasedItems([item, newItem], paid), [newItem]);
  assert.equal(removePurchasedItems([{ ...item, quantity: 3 }], paid)[0].quantity, 1);
  const edited = { ...item, configuration: { ...item.configuration, width: 35 } };
  assert.deepEqual(removePurchasedItems([edited], paid), [edited]);
  assert.deepEqual(removePurchasedItems([item], [{ ...paid[0], id: 'buy-now' }]), [item]);
});
test('JSON-LD cannot close its script element', () => {
  const data = { name: '</script><script>alert(1)</script>' };
  assert.ok(!serializeJsonLd(data).includes('<'));
  assert.deepEqual(JSON.parse(serializeJsonLd(data)), data);
});
test('landing UTMs survive navigation, refresh, storage denial, and expire after inactivity', () => {
  const values = new Map();
  global.sessionStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  global.window = { location: { search: '?utm_source=meta&utm_campaign=sleep&utm_content=creative-a', origin: 'https://shop.test' } };
  global.document = { referrer: 'https://social.test/ad?private=secret' };
  const realNow = Date.now;
  let now = realNow();
  Date.now = () => now;
  try {
    let sessionModule = require('../src/lib/store-session');
    const landing = sessionModule.initializeStoreSession();
    assert.equal(landing.attribution.referrer, 'https://social.test/ad');
    window.location.search = '';
    const product = sessionModule.initializeStoreSession();
    assert.equal(product.id, landing.id);
    assert.equal(product.attribution.utmContent, 'creative-a');
    delete require.cache[require.resolve('../src/lib/store-session')];
    sessionModule = require('../src/lib/store-session');
    assert.equal(sessionModule.initializeStoreSession().id, landing.id);
    now += sessionModule.SESSION_TIMEOUT_MS + 1;
    const later = sessionModule.initializeStoreSession();
    assert.notEqual(later.id, landing.id);
    assert.equal(later.attribution.utmSource, null);
    window.location.search = '?utm_source=meta&utm_campaign=new';
    const campaign = sessionModule.initializeStoreSession();
    assert.notEqual(campaign.id, later.id);
    sessionStorage.setItem = () => { throw new Error('blocked'); };
    assert.equal(sessionModule.initializeStoreSession().id, campaign.id);
  } finally { Date.now = realNow; delete global.window; delete global.document; delete global.sessionStorage; }
});
