import type { CartItem, Product, ProductConfiguration } from "@/types";

import { initializeStoreSession } from "./store-session";

type StoreEventType = "product_view" | "add_to_cart" | "cart_view" | "cart_updated" | "checkout_attempt" | "checkout_initiated" | "checkout_error";

interface StoreEventPayload {
  productHandle?: string;
  productTitle?: string;
  quantity?: number;
  value?: number;
  configuration?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

function sendStoreEvent(eventType: StoreEventType, payload: StoreEventPayload) {
  if (typeof window === "undefined") return;

  try {
    const context = getStoreSessionContext();
    if (!context) return;
    const body = JSON.stringify({
      eventType,
      ...context,
      ...payload,
      meta: { snapshotAt: Date.now(), ...payload.meta, utmContent: context.utmContent, utmTerm: context.utmTerm },
    });
    // keepalive lets the request survive navigation (e.g. redirect to checkout)
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

function configurationSummary(configuration: ProductConfiguration): Record<string, unknown> {
  const entries = Object.entries(configuration).filter(
    ([, value]) => value !== null && value !== undefined && value !== "" && value !== 0
  );
  return Object.fromEntries(entries);
}

export function trackStoreProductView(product: Product) {
  sendStoreEvent("product_view", {
    productHandle: product.slug,
    productTitle: product.name,
    value: product.price,
  });
}

export function trackStoreAddToCart(product: Product, configuration: ProductConfiguration, items: CartItem[]) {
  sendStoreEvent("add_to_cart", {
    productHandle: product.slug,
    productTitle: product.name,
    quantity: 1,
    value: product.price,
    configuration: configurationSummary(configuration),
    meta: { items: cartSnapshot(items), cartTotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) },
  });
}

function cartSnapshot(items: CartItem[]) {
  return items.map(item => ({
    handle: item.product.slug, title: item.product.name, quantity: item.quantity,
    price: item.product.price, configuration: configurationSummary(item.configuration),
  }));
}

export function trackStoreCartUpdated(items: CartItem[], total: number) {
  sendStoreEvent("cart_updated", { value: total, meta: { items: cartSnapshot(items), snapshotAt: Date.now() } });
}

export function trackStoreCheckoutAttempt(items: CartItem[], total: number) {
  sendStoreEvent("checkout_attempt", { value: total, meta: { items: cartSnapshot(items) } });
}

export function trackStoreCheckoutError() {
  // Keep raw server errors and customer data out of analytics.
  sendStoreEvent("checkout_error", { meta: { reason: "checkout_creation_failed" } });
}

export function trackStoreCartView(items: CartItem[], total: number) {
  sendStoreEvent("cart_view", {
    quantity: items.reduce((sum, item) => sum + item.quantity, 0),
    value: total,
    meta: {
      items: items.map((item) => ({
        handle: item.product.slug,
        title: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        configuration: configurationSummary(item.configuration),
      })),
    },
  });
}

export function trackStoreCheckoutInitiated(items: CartItem[], total: number) {
  sendStoreEvent("checkout_initiated", {
    quantity: items.reduce((sum, item) => sum + item.quantity, 0),
    value: total,
    meta: {
      items: items.map((item) => ({
        handle: item.product.slug,
        title: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        configuration: configurationSummary(item.configuration),
      })),
    },
  });
}

export interface StoreSessionContext {
  sessionId: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referrer: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  deviceType: string;
  userAgent: string;
  sessionDurationSeconds: number;
}

// Exposed so the checkout request can carry the same session/attribution data
// as the tracked events, letting an abandoned checkout be attributed the same
// way an abandoned cart is.
export function getStoreSessionContext(): StoreSessionContext | null {
  if (typeof window === "undefined") return null;

  const session = initializeStoreSession();
  if (!session) return null;
  return {
    sessionId: session.id,
    ...session.attribution,
    deviceType: getDeviceType(),
    userAgent: navigator.userAgent,
    sessionDurationSeconds: Math.round((Date.now() - session.startedAt) / 1000),
  };
}
