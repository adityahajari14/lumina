"use client";
import { useEffect, useRef, useState } from 'react';
import { createCheckout } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { getStoreSessionContext, trackStoreCheckoutAttempt, trackStoreCheckoutInitiated, trackStoreCheckoutError } from '@/lib/store-events';
import { trackInitiateCheckout } from '@/lib/meta-pixel';
import { trackClarityInitiateCheckout } from '@/lib/clarity';
import { cartItemToCheckoutRequest } from '@/lib/checkout';
import type { CartItem, CheckoutResponse } from '@/types';

export function useCheckout() {
  const { markCheckoutPending } = useCart();
  const busy = useRef(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  useEffect(() => {
    const resume = (event: PageTransitionEvent) => {
      if (event.persisted) { busy.current = false; setIsCheckingOut(false); }
    };
    window.addEventListener('pageshow', resume);
    return () => window.removeEventListener('pageshow', resume);
  }, []);
  const checkout = async (items: CartItem[]): Promise<CheckoutResponse | null> => {
    if (busy.current || !items.length) return null;
    busy.current = true;
    setIsCheckingOut(true);
    setCheckoutError(null);
    trackStoreCheckoutAttempt(items, items.reduce((sum, item) => sum + item.product.price * item.quantity, 0));
    try {
      const result = await createCheckout(items.map(cartItemToCheckoutRequest), undefined, getStoreSessionContext());
      markCheckoutPending(result.draftOrderId, items);
      trackStoreCheckoutInitiated(items, result.subtotal);
      try { trackInitiateCheckout(items, items[0].product.currency); } catch { /* optional analytics */ }
      try { trackClarityInitiateCheckout(items); } catch { /* optional analytics */ }
      window.location.assign(result.checkoutUrl);
      return result;
    } catch (error) {
      trackStoreCheckoutError();
      setCheckoutError(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
      busy.current = false;
      setIsCheckingOut(false);
      return null;
    }
  };
  return { checkout, isCheckingOut, checkoutError, setCheckoutError };
}
