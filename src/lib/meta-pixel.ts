import type { CartItem, Product } from "@/types";

const META_PIXEL_ID = "963077733004633";

type Fbq = {
  (eventType: "track", eventName: string, parameters?: PixelPayload): void;
  (eventType: "init", pixelId: string): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  push?: Fbq;
  loaded?: boolean;
  version?: string;
};

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
    _fbq?: Fbq;
  }
}

function ensureMetaPixel() {
  if (typeof window === "undefined") {
    return false;
  }

  if (typeof window.fbq === "function") {
    return true;
  }

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }

    fbq.queue = fbq.queue || [];
    fbq.queue.push(args);
  } as Fbq;

  window.fbq = fbq;
  window._fbq = window._fbq || fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  if (typeof document !== "undefined" && !document.getElementById("meta-pixel-sdk")) {
    const script = document.createElement("script");
    script.id = "meta-pixel-sdk";
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode?.insertBefore(script, firstScript);
  }

  fbq("init", META_PIXEL_ID);
  return true;
}

function trackMetaPixelEvent(eventName: string, payload: PixelPayload) {
  if (!ensureMetaPixel() || typeof window.fbq !== "function") {
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

function getCheckoutPayload(items: CartItem[], currency: string): PixelPayload {
  const contents = items.map((item) => ({
    id: item.product.slug,
    quantity: item.quantity,
    item_price: item.product.price,
  }));

  return {
    content_ids: items.map((item) => item.product.slug),
    content_type: "product",
    contents,
    currency,
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    value: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  };
}

export function trackPageView() {
  trackMetaPixelEvent("PageView", {});
}

export function trackViewContent(product: Product) {
  trackMetaPixelEvent("ViewContent", getProductPayload(product));
}

export function trackAddToCart(product: Product, quantity: number = 1) {
  trackMetaPixelEvent("AddToCart", getProductPayload(product, quantity));
}

export function trackInitiateCheckout(items: CartItem[], currency: string) {
  trackMetaPixelEvent("InitiateCheckout", getCheckoutPayload(items, currency));
}
