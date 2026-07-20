import {
  CheckoutItemRequest,
  CheckoutResponse,
  CustomizationPricing,
  PriceBandMatrix,
  PriceValidationResponse,
  PricingRequest,
} from '@/types';
import type { StoreSessionContext } from '@/lib/store-events';

const SERVER_API_CACHE_REVALIDATE_SECONDS =
  Number(process.env.SERVER_API_CACHE_REVALIDATE_SECONDS || 3_600);

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fetchOptions: RequestInit = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const method = (fetchOptions.method || 'GET').toUpperCase();
  if (typeof window === 'undefined' && method === 'GET') {
    (fetchOptions as RequestInit & { next?: { revalidate: number } }).next = {
      revalidate: SERVER_API_CACHE_REVALIDATE_SECONDS,
    };
  }

  const response = await fetch(`${getApiBaseUrl()}${normalizedEndpoint}`, fetchOptions);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${response.status}`);
  }

  return response.json();
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string };
}

export async function fetchPriceMatrix(handle: string): Promise<PriceBandMatrix> {
  const response = await apiFetch<ApiResponse<PriceBandMatrix>>(`/api/pricing/matrix/${handle}`);
  return response.data;
}

export async function fetchCustomizationPricing(): Promise<CustomizationPricing[]> {
  const response = await apiFetch<ApiResponse<CustomizationPricing[]>>('/api/pricing/customizations');
  return response.data;
}

export async function validateCartPrice(
  request: PricingRequest,
  submittedPrice: number
): Promise<PriceValidationResponse> {
  const response = await apiFetch<ApiResponse<PriceValidationResponse>>('/api/pricing/validate', {
    method: 'POST',
    body: JSON.stringify({ ...request, submittedPrice }),
  });
  return response.data;
}

export async function createCheckout(
  items: CheckoutItemRequest[],
  customerEmail?: string,
  session?: StoreSessionContext | null
): Promise<CheckoutResponse> {
  const response = await apiFetch<ApiResponse<CheckoutResponse>>('/api/orders/create-checkout', {
    method: 'POST',
    body: JSON.stringify({
      items,
      customerEmail,
      sessionId: session?.sessionId,
      utmSource: session?.utmSource,
      utmMedium: session?.utmMedium,
      utmCampaign: session?.utmCampaign,
      referrer: session?.referrer,
      deviceType: session?.deviceType,
      userAgent: session?.userAgent,
      sessionDurationSeconds: session?.sessionDurationSeconds,
    }),
  });

  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to create checkout');
  }

  return response.data;
}

export function formatPrice(price: number): number {
  return Math.round(price * 100) / 100;
}

export function getCurrencySymbol(code: string): string {
  const symbols: Record<string, string> = {
    GBP: '£',
    EUR: '€',
    USD: '$',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
  };
  return symbols[code.toUpperCase()] || code;
}

export function formatPriceWithCurrency(price: number, currency: string = 'USD'): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = formatPrice(price);
  return `${symbol}${formatted.toFixed(2)}`;
}
