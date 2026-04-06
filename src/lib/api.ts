import {
  CheckoutItemRequest,
  CheckoutResponse,
  CustomizationPricing,
  PriceBandMatrix,
  PriceValidationResponse,
  PricingRequest,
  PricingResponse,
} from '@/types';

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${getApiBaseUrl()}${normalizedEndpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

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

export async function calculatePriceFromBackend(request: PricingRequest): Promise<PricingResponse> {
  const response = await apiFetch<ApiResponse<PricingResponse>>('/api/pricing/calculate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
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
  customerEmail?: string
): Promise<CheckoutResponse> {
  const response = await apiFetch<ApiResponse<CheckoutResponse>>('/api/orders/create-checkout', {
    method: 'POST',
    body: JSON.stringify({ items, customerEmail }),
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
