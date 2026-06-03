import type { CartItem, Product } from "@/types";

type Clarity = {
  (command: "event", eventName: string): void;
  (command: "set", key: string, value: string | string[]): void;
};

declare global {
  interface Window {
    clarity?: Clarity;
  }
}

function trackClarityEvent(eventName: string) {
  if (typeof window === "undefined" || typeof window.clarity !== "function") {
    return;
  }

  window.clarity("event", eventName);
}

export function trackClarityProductView(product: Product) {
  trackClarityEvent(`ViewContent:${product.slug}`);
}

export function trackClarityAddToCart(product: Product) {
  trackClarityEvent(`AddToCart:${product.slug}`);
}

export function trackClarityInitiateCheckout(items: CartItem[]) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  trackClarityEvent("ReachedCheckout");
  trackClarityEvent(`InitiateCheckout:${itemCount}`);
}
