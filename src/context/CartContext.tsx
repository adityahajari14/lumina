'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductConfiguration, Cart, CartItem, CartContextType } from '@/types';
import { trackAddToCart } from '@/lib/meta-pixel';
import { trackShopifyAddToCart } from '@/lib/shopify-analytics';

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

interface SerializableCartItem extends Omit<CartItem, 'addedAt'> {
  addedAt: string;
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

export const CartProvider = ({ children }: CartProviderProps) => {
  const router = useRouter();
  const hasInitializedRef = useRef(false);
  const [cart, setCart] = useState<Cart>(getInitialCartState);

  const applyCartItems = (items: CartItem[]) => {
    setCart(buildCartState(items));
  };

  useEffect(() => {
    hasInitializedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasInitializedRef.current) return;

    if (cart.items.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [cart]);

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
    trackAddToCart(product);
    trackShopifyAddToCart(product);
    router.push('/cart');
  };

  const removeFromCart = (itemId: string) => {
    const updatedItems = cart.items.filter((item) => item.id !== itemId);
    applyCartItems(updatedItems);

    if (updatedItems.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  };

  const updateCartItemConfiguration = (
    itemId: string,
    configuration: ProductConfiguration,
    productPrice: number
  ) => {
    const updatedItems = cart.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            configuration,
            product: {
              ...item.product,
              price: productPrice,
            },
          }
        : item
    );
    applyCartItems(updatedItems);
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
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartItemConfiguration,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
