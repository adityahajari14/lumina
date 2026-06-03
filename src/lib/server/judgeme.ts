import type { ProductReview } from "@/types";

const JUDGEME_API_BASE_URL = "https://judge.me/api/v1";

export interface JudgeMeProductRef {
  id: string;
  handle: string;
}

export interface JudgeMeReviewSubmission extends JudgeMeProductRef {
  name: string;
  email: string;
  rating: number;
  title?: string;
  body: string;
  ipAddress?: string;
}

interface JudgeMeReviewer {
  name?: unknown;
  email?: unknown;
}

interface JudgeMeProduct {
  external_id?: unknown;
  id?: unknown;
  handle?: unknown;
  title?: unknown;
}

interface JudgeMeReview {
  id?: unknown;
  reviewer?: JudgeMeReviewer;
  reviewer_name?: unknown;
  name?: unknown;
  rating?: unknown;
  title?: unknown;
  body?: unknown;
  comments?: unknown;
  created_at?: unknown;
  verified?: unknown;
  product_external_id?: unknown;
  product_id?: unknown;
  product_handle?: unknown;
  product_title?: unknown;
  product?: JudgeMeProduct;
}

interface JudgeMeReviewsResponse {
  reviews?: JudgeMeReview[];
  review?: JudgeMeReview;
}

function getJudgeMeConfig() {
  return {
    apiToken:
      process.env.JUDGEME_PRIVATE_API_TOKEN ||
      process.env.JUDGEME_API_TOKEN ||
      "",
    shopDomain:
      process.env.JUDGEME_SHOP_DOMAIN ||
      process.env.SHOPIFY_STORE_DOMAIN ||
      process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
      "",
  };
}

export function isJudgeMeConfigured() {
  const config = getJudgeMeConfig();
  return Boolean(config.apiToken && config.shopDomain);
}

function normalizeDomain(domain: string) {
  return domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function getExternalShopifyProductId(productId: string) {
  const match = productId.match(/Product\/(\d+)$/);
  if (match?.[1]) return match[1];
  if (/^\d+$/.test(productId)) return productId;
  return "";
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeNumber(value: unknown, fallback: number) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function valueMatches(expected: string, value: unknown) {
  if (!expected) return false;
  return String(value || "") === expected;
}

function reviewMatchesProduct(review: JudgeMeReview, product: JudgeMeProductRef) {
  const externalProductId = getExternalShopifyProductId(product.id);

  return (
    valueMatches(externalProductId, review.product_external_id) ||
    valueMatches(externalProductId, review.product?.external_id) ||
    valueMatches(externalProductId, review.product_id) ||
    valueMatches(product.handle, review.product_handle) ||
    valueMatches(product.handle, review.product?.handle)
  );
}

function normalizeReview(review: JudgeMeReview, index: number): ProductReview {
  const content = normalizeString(review.body) || normalizeString(review.comments);
  const author =
    normalizeString(review.reviewer?.name) ||
    normalizeString(review.reviewer_name) ||
    normalizeString(review.name) ||
    "Verified customer";
  const date = normalizeString(review.created_at);

  return {
    id: normalizeNumber(review.id, Date.now() + index),
    author,
    rating: Math.max(1, Math.min(5, normalizeNumber(review.rating, 5))),
    date: date || new Date().toISOString(),
    title: normalizeString(review.title) || "Customer review",
    content,
    verified: Boolean(review.verified),
    product:
      normalizeString(review.product_title) ||
      normalizeString(review.product?.title) ||
      undefined,
  };
}

async function judgeMeFetch<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${JUDGEME_API_BASE_URL}${endpoint}`, {
    ...init,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Judge.me request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchJudgeMeReviews(product: JudgeMeProductRef) {
  const config = getJudgeMeConfig();
  if (!config.apiToken || !config.shopDomain) return null;

  const params = new URLSearchParams({
    api_token: config.apiToken,
    shop_domain: normalizeDomain(config.shopDomain),
    per_page: "100",
    page: "1",
    published: "true",
  });

  const data = await judgeMeFetch<JudgeMeReviewsResponse>(`/reviews?${params}`);
  const reviews = Array.isArray(data.reviews) ? data.reviews : [];

  return reviews
    .filter((review) => reviewMatchesProduct(review, product))
    .map((review, index) => normalizeReview(review, index))
    .filter((review) => review.content);
}

export async function createJudgeMeReview(submission: JudgeMeReviewSubmission) {
  const config = getJudgeMeConfig();
  if (!config.apiToken || !config.shopDomain) {
    throw new Error("Judge.me is not configured");
  }

  const externalProductId = getExternalShopifyProductId(submission.id);
  if (!externalProductId) {
    throw new Error("A Shopify product ID is required to sync reviews with Judge.me");
  }

  const params = new URLSearchParams({
    api_token: config.apiToken,
    shop_domain: normalizeDomain(config.shopDomain),
    platform: "shopify",
    name: submission.name,
    email: submission.email,
    rating: String(submission.rating),
    body: submission.body,
    id: externalProductId,
  });

  if (submission.title) params.set("title", submission.title);
  if (submission.ipAddress) params.set("ip_addr", submission.ipAddress);

  const data = await judgeMeFetch<JudgeMeReviewsResponse>("/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  return normalizeReview(data.review || {}, 0);
}
