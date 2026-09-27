"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { Product, ProductConfiguration, CartContextType, CartItem } from '@/types';
import { trackClarityAddToCart } from '@/lib/clarity';
import { trackAddToCart } from '@/lib/meta-pixel';
import { trackShopifyAddToCart } from '@/lib/shopify-analytics';
import { trackStoreAddToCart, trackStoreCartUpdated } from '@/lib/store-events';
import { readStorage, writeStorage } from '@/lib/browser-storage';
import { buildCartState, restoreCart, EMPTY_CART, cartLineFingerprint, removePurchasedItems, type PurchasedLine } from '@/lib/cart-state';
import { fetchWithTimeout } from '@/lib/fetch-with-timeout';

const CartContext = createContext<CartContextType | undefined>(undefined);
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
interface PendingCheckout { draftOrderId: string; createdAt: string; items?: PurchasedLine[] }
const PENDING_KEY = 'pendingCheckouts_v2';
function readPending(): PendingCheckout[] {
  try {
    const records = JSON.parse(readStorage(PENDING_KEY) || '[]');
    const legacy = JSON.parse(readStorage('pendingCheckout') || 'null');
    return [...(Array.isArray(records) ? records : []), ...(legacy ? [legacy] : [])]
      .filter(r => typeof r?.draftOrderId === 'string' && Date.parse(r.createdAt) <= Date.now() && Date.now() - Date.parse(r.createdAt) < 30 * 24 * 60 * 60 * 1000);
  } catch { return []; }
}
export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Identical server/first-client snapshots prevent saved-cart hydration errors.
  const [cart, setCart] = useState(EMPTY_CART);
  const cartRef = useRef(EMPTY_CART);
  const [isCartReady, setCartReady] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const applyCartItems = useCallback((items: CartItem[]) => {
    const next = buildCartState(items);
    cartRef.current = next;
    setCart(next);
    writeStorage('cart', items.length ? JSON.stringify(next) : null);
  }, []);
  useEffect(() => {
    const restored = restoreCart(readStorage('cart'));
    cartRef.current = restored;
    setCart(restored);
    setCartReady(true);
  }, []);
  useEffect(() => {
    if (!isCartReady) return;
    let checking = false;
    let disposed = false;
    const checkPaid = async () => {
      if (checking || document.visibilityState === 'hidden') return;
      checking = true;
      try {
        for (const record of readPending()) {
          try {
            const response = await fetchWithTimeout(`/api/orders/checkout-status?draftOrderId=${encodeURIComponent(record.draftOrderId)}`, { cache: 'no-store' });
            if (!response.ok) continue;
            const data = await response.json();
            if (disposed) return;
            if (data.purchased === true) {
              // Only remove purchased lines; preserve new/edited items and Buy Now carts.
              if (Array.isArray(record.items)) applyCartItems(removePurchasedItems(cartRef.current.items, record.items));
              writeStorage(PENDING_KEY, JSON.stringify(readPending().filter(r => r.draftOrderId !== record.draftOrderId)));
              writeStorage('pendingCheckout', null);
            }
          } catch { /* preserve cart and retry on return/focus */ }
        }
      } finally { checking = false; }
    };
    void checkPaid();
    window.addEventListener('focus', checkPaid);
    window.addEventListener('pageshow', checkPaid);
    document.addEventListener('visibilitychange', checkPaid);
    return () => {
      disposed = true;
      window.removeEventListener('focus', checkPaid);
      window.removeEventListener('pageshow', checkPaid);
      document.removeEventListener('visibilitychange', checkPaid);
    };
  }, [isCartReady, applyCartItems]);
  const hadCart = useRef(false);
  useEffect(() => {
    if (!isCartReady || (!cart.items.length && !hadCart.current)) return;
    hadCart.current = cart.items.length > 0;
    const timer = setTimeout(() => trackStoreCartUpdated(cart.items, cart.total), 250);
    return () => clearTimeout(timer);
  }, [cart, isCartReady]);
  const addToCart = (product: Product, configuration: ProductConfiguration) => {
    const items = [...cartRef.current.items, { id: crypto.randomUUID(), product, configuration, quantity: 1, addedAt: new Date() }];
    applyCartItems(items);
    setIsCartOpen(true);
    trackStoreAddToCart(product, configuration, items);
    // Optional analytics must not interrupt a successful cart update.
    for (const track of [trackClarityAddToCart, trackAddToCart, trackShopifyAddToCart]) {
      try { track(product); } catch { /* optional analytics */ }
    }
  };
  const removeFromCart = (id: string) => applyCartItems(cartRef.current.items.filter(i => i.id !== id));
  const updateQuantity = (id: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity > 100) return;
    if (quantity <= 0) return removeFromCart(id);
    applyCartItems(cartRef.current.items.map(i => i.id === id ? { ...i, quantity } : i));
  };
  const updateCartItemConfiguration = (id: string, configuration: ProductConfiguration, price: number) => {
    if (!Number.isFinite(price) || price <= 0) return;
    applyCartItems(cartRef.current.items.map(i => i.id === id ? { ...i, configuration, product: { ...i.product, price } } : i));
  };
  const markCheckoutPending = (draftOrderId: string, items: CartItem[]) => {
    const record: PendingCheckout = { draftOrderId, createdAt: new Date().toISOString(),
      items: items.map(i => ({ id: i.id, quantity: i.quantity, fingerprint: cartLineFingerprint(i) })) };
    writeStorage(PENDING_KEY, JSON.stringify([...readPending().filter(r => r.draftOrderId !== draftOrderId), record].slice(-10)));
    writeStorage('pendingCheckout', null);
  };
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  return <CartContext.Provider value={{ cart, isCartReady, addToCart, removeFromCart, updateCartItemConfiguration,
    updateQuantity, clearCart: () => applyCartItems([]), markCheckoutPending, isCartOpen, openCart, closeCart }}>
    {children}
  </CartContext.Provider>;
};
