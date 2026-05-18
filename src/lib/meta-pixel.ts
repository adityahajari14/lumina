import type { CheckoutResponse, Product } from "@/types";

type Fbq = (eventType: "track", eventName: string, parameters?: PixelPayload) => void;

export type PixelContent = {
  id: string;
  quantity: number;
  item_price?: number;
};

export type PixelPayload = {
  content_ids?: string[];
  content_name?: string;
  content_type?: "product";
  contents?: PixelContent[];
  currency?: string;
  num_items?: number;
  order_id?: string;
  value?: number;
};

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

function trackMetaPixelEvent(eventName: string, payload: PixelPayload) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  window.fbq("track", eventName, payload);
}

function getProductPayload(product: Product, quantity: number = 1): PixelPayload {
  return {
    content_ids: [product.slug],
    content_name: product.name,
    content_type: "product",
    contents: [
      {
        id: product.slug,
        quantity,
        item_price: product.price,
      },
    ],
    currency: product.currency,
    num_items: quantity,
    value: product.price * quantity,
  };
}

function getCheckoutPayload(checkout: CheckoutResponse, currency: string): PixelPayload {
  const contents = checkout.lineItems.map((item) => ({
    id: item.handle,
    quantity: item.quantity,
    item_price: item.calculatedPrice,
  }));

  return {
    content_ids: checkout.lineItems.map((item) => item.handle),
    content_type: "product",
    contents,
    currency,
    num_items: checkout.lineItems.reduce((sum, item) => sum + item.quantity, 0),
    value: checkout.subtotal,
  };
}

export function trackAddToCart(product: Product, quantity: number = 1) {
  trackMetaPixelEvent("AddToCart", getProductPayload(product, quantity));
}

export function trackInitiateCheckout(checkout: CheckoutResponse, currency: string) {
  trackMetaPixelEvent("InitiateCheckout", getCheckoutPayload(checkout, currency));
}
