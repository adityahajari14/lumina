import { DEFAULT_CONFIGURATION, type Cart, type CartItem } from '../types';
export const EMPTY_CART: Cart = { items: [], total: 0, itemCount: 0 };
export function buildCartState(items: CartItem[]): Cart {
  return { items, total: items.reduce((s, i) => s + i.product.price * i.quantity, 0), itemCount: items.reduce((s, i) => s + i.quantity, 0) };
}
export function restoreCart(raw: string | null): Cart {
  try {
    const data = JSON.parse(raw || 'null');
    if (!Array.isArray(data?.items)) return EMPTY_CART;
    const items: CartItem[] = data.items.filter((i: CartItem) =>
      i && typeof i.id === 'string' && i.product && typeof i.product.id === 'string' &&
      typeof i.product.slug === 'string' && typeof i.product.name === 'string' &&
      Array.isArray(i.product.images) && i.product.images.length > 0 && i.product.images.every(src => typeof src === 'string' && (src.startsWith('/') && !src.startsWith('//') || src.startsWith('https://cdn.shopify.com/'))) && typeof i.product.currency === 'string' && i.product.features &&
      Number.isFinite(i.product.price) && i.product.price > 0 && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 100 &&
      i.configuration && Number.isFinite(i.configuration.width) && Number.isFinite(i.configuration.height) &&
      Object.entries(i.configuration).every(([key, value]) => key in DEFAULT_CONFIGURATION && (value === null || typeof value === 'string' || typeof value === 'number')) &&
      ['inches', 'cm'].includes(i.configuration.widthUnit) && ['inches', 'cm'].includes(i.configuration.heightUnit)
    ).slice(0, 100).map((i: CartItem) => ({ ...i, configuration: { ...DEFAULT_CONFIGURATION, ...i.configuration }, addedAt: new Date(i.addedAt) }));
    return buildCartState(items);
  } catch { return EMPTY_CART; }
}
export function cartLineFingerprint(item: CartItem) {
  return JSON.stringify([item.product.slug, item.product.price, Object.entries(item.configuration).sort(([a], [b]) => a.localeCompare(b))]);
}
export interface PurchasedLine { id: string; quantity: number; fingerprint: string }
export function removePurchasedItems(items: CartItem[], purchased: PurchasedLine[]) {
  return items.flatMap(item => {
    const line = purchased.find(p => p.id === item.id && p.fingerprint === cartLineFingerprint(item));
    if (!line || !Number.isInteger(line.quantity) || line.quantity <= 0) return [item];
    const quantity = item.quantity - line.quantity;
    return quantity > 0 ? [{ ...item, quantity }] : [];
  });
}
