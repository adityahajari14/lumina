'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductConfiguration, Cart, CartItem, CartContextType } from '@/types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

const CART_STORAGE_KEY = 'cart';
const CART_SYNC_META_KEY = 'cart_account_sync_meta';
const CART_ACCOUNT_SYNC_TTL_MS = 2 * 60 * 1000;

interface CartApiResponse {
  success: boolean;
  data?: { items: SerializableCartItem[] };
  error?: { message: string };
}

interface SerializableCartItem extends Omit<CartItem, 'addedAt'> {
  addedAt: string;
}

interface CartSyncMeta {
  email: string;
  syncedAt: number;
}

const calculateTotals = (items: CartItem[]) => ({
  total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
});

const buildCartState = (items: CartItem[]) => {
  const { total, itemCount } = calculateTotals(items);
  return { items, total, itemCount };
};

const getInitialCartState = (): Cart => {
  if (typeof window === 'undefined') {
    return { items: [], total: 0, itemCount: 0 };
  }

  const savedCart = localStorage.getItem(CART_STORAGE_KEY);
  if (!savedCart) {
    return { items: [], total: 0, itemCount: 0 };
  }

  try {
    const parsedCart = JSON.parse(savedCart);
    const parsedItems = Array.isArray(parsedCart.items)
      ? parsedCart.items.map((item: SerializableCartItem) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }))
      : [];

    return buildCartState(parsedItems);
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY);
    return { items: [], total: 0, itemCount: 0 };
  }
};

const getCartSyncMeta = (): CartSyncMeta | null => {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(CART_SYNC_META_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<CartSyncMeta>;
    if (typeof parsed.email !== 'string' || typeof parsed.syncedAt !== 'number') {
      localStorage.removeItem(CART_SYNC_META_KEY);
      return null;
    }

    return { email: parsed.email, syncedAt: parsed.syncedAt };
  } catch {
    localStorage.removeItem(CART_SYNC_META_KEY);
    return null;
  }
};

const setCartSyncMeta = (email: string) => {
  if (typeof window === 'undefined') return;

  const payload: CartSyncMeta = {
    email,
    syncedAt: Date.now(),
  };
  localStorage.setItem(CART_SYNC_META_KEY, JSON.stringify(payload));
};

const clearCartSyncMeta = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_SYNC_META_KEY);
};

export const CartProvider = ({ children }: CartProviderProps) => {
  const router = useRouter();
  const hasInitializedRef = useRef(false);
  const accountCustomerEmailRef = useRef<string | null>(null);
  const lastSyncedCustomerRef = useRef<string | null>(null);
  const [cart, setCart] = useState<Cart>(getInitialCartState);

  const toSerializableItems = (items: CartItem[]): SerializableCartItem[] =>
    items.map((item) => ({
      ...item,
      addedAt: item.addedAt.toISOString(),
    }));

  const fromSerializableItems = (items: SerializableCartItem[]): CartItem[] =>
    items.map((item) => ({
      ...item,
      addedAt: new Date(item.addedAt),
    }));

  const applyCartItems = (items: CartItem[]) => {
    setCart(buildCartState(items));
  };

  const loadLocalCart = (): CartItem[] => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) return [];

    try {
      const parsedCart = JSON.parse(savedCart);
      const parsedItems = Array.isArray(parsedCart.items)
        ? parsedCart.items.map((item: SerializableCartItem) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          }))
        : [];
      return parsedItems;
    } catch (error) {
      console.error('Error loading local cart:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
  };

  // Mark cart state ready after first client render.
  useEffect(() => {
    hasInitializedRef.current = true;
  }, []);

  // Persist cart locally for guests, and as fallback cache for signed-in users.
  useEffect(() => {
    if (!hasInitializedRef.current) return;

    if (cart.items.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [cart]);

  // Persist cart to account storage only after an authenticated cart sync has established identity.
  useEffect(() => {
    if (!hasInitializedRef.current) return;
    if (!accountCustomerEmailRef.current) return;
    const customerEmail = accountCustomerEmailRef.current;

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: toSerializableItems(cart.items) }),
        });

        if (response.ok) {
          setCartSyncMeta(customerEmail);
        }
      } catch (error) {
        console.error('Failed to persist account cart:', error);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [cart.items]);

  const syncAccountCart = async (): Promise<string | null> => {
    try {
      const authRes = await fetch('/api/auth/me', { cache: 'no-store' });
      if (!authRes.ok) {
        accountCustomerEmailRef.current = null;
        lastSyncedCustomerRef.current = null;
        clearCartSyncMeta();
        return null;
      }

      const authPayload = await authRes.json();
      const customerEmail = authPayload?.data?.email as string | undefined;

      if (!customerEmail) {
        accountCustomerEmailRef.current = null;
        lastSyncedCustomerRef.current = null;
        clearCartSyncMeta();
        return null;
      }

      accountCustomerEmailRef.current = customerEmail;
      const localItems = loadLocalCart();
      const syncMeta = getCartSyncMeta();
      const recentlySynced =
        syncMeta?.email === customerEmail &&
        Date.now() - syncMeta.syncedAt < CART_ACCOUNT_SYNC_TTL_MS;

      if (
        lastSyncedCustomerRef.current === customerEmail ||
        (recentlySynced && localItems.length === 0)
      ) {
        lastSyncedCustomerRef.current = customerEmail;
        return customerEmail;
      }

      let serverItems: CartItem[] = [];

      const serverRes = await fetch('/api/cart', { cache: 'no-store' });
      if (serverRes.ok) {
        const payload = (await serverRes.json()) as CartApiResponse;
        serverItems = fromSerializableItems(payload.data?.items || []);
      }

      if (localItems.length > 0) {
        const mergeRes = await fetch('/api/cart/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: toSerializableItems(localItems) }),
        });

        if (mergeRes.ok) {
          const payload = (await mergeRes.json()) as CartApiResponse;
          const mergedItems = fromSerializableItems(payload.data?.items || []);
          applyCartItems(mergedItems);
          localStorage.removeItem(CART_STORAGE_KEY);
          lastSyncedCustomerRef.current = customerEmail;
          setCartSyncMeta(customerEmail);
          return customerEmail;
        }
      }

      applyCartItems(serverItems.length > 0 ? serverItems : localItems);
      lastSyncedCustomerRef.current = customerEmail;
      setCartSyncMeta(customerEmail);
      return customerEmail;
    } catch (error) {
      console.error('Cart sync error:', error);
      return null;
    }
  };

  const addToCart = (product: Product, configuration: ProductConfiguration) => {
    const newItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      product,
      configuration,
      quantity: 1,
      addedAt: new Date(),
    };

    const updatedItems = [...cart.items, newItem];
    applyCartItems(updatedItems);
    router.push('/cart');
  };

  const removeFromCart = (itemId: string) => {
    const updatedItems = cart.items.filter((item) => item.id !== itemId);
    applyCartItems(updatedItems);

    if (updatedItems.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedItems = cart.items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    applyCartItems(updatedItems);
  };

  const clearCart = () => {
    setCart({ items: [], total: 0, itemCount: 0 });
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, syncAccountCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
