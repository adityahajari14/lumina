import type { ProductReview, ProductReviewMedia } from "@/types";

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
  pictures?: unknown;
  picture_urls?: unknown;
  videos?: unknown;
  video_urls?: unknown;
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

function isSafeMediaUrl(value: string) {
  return /^https?:\/\//.test(value) || value.startsWith("/");
}

function getObjectValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

function getNestedObjectValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nestedValue = getObjectValue(value as Record<string, unknown>, [
        "original",
        "original_url",
        "large",
        "large_url",
        "medium",
        "medium_url",
        "small",
        "small_url",
        "url",
        "src",
      ]);

      if (nestedValue) return nestedValue;
    }
  }

  return "";
}

function inferMediaType(url: string, fallback: ProductReviewMedia["type"]) {
  return /\.(mp4|m4v|mov|webm)(\?|#|$)/i.test(url) ? "video" : fallback;
}

function normalizeMediaItem(
  item: unknown,
  fallbackType: ProductReviewMedia["type"],
  alt: string
): ProductReviewMedia | null {
  if (typeof item === "string") {
    const src = item.trim();
    if (!src || !isSafeMediaUrl(src)) return null;

    return {
      type: inferMediaType(src, fallbackType),
      src,
      alt,
    };
  }

  if (!item || typeof item !== "object" || Array.isArray(item)) return null;

  const record = item as Record<string, unknown>;
  const hidden =
    record.hidden === true ||
    record.is_hidden === true ||
    record.published === false ||
    record.is_published === false;

  if (hidden) return null;

  const src =
    getObjectValue(record, [
      "url",
      "src",
      "original",
      "original_url",
      "large_url",
      "medium_url",
      "small_url",
    ]) || getNestedObjectValue(record, ["urls", "image", "picture", "video"]);

  if (!src || !isSafeMediaUrl(src)) return null;

  const thumbnailSrc =
    getObjectValue(record, [
      "thumbnail",
      "thumbnail_url",
      "preview",
      "preview_url",
      "poster",
      "poster_url",
    ]) || getNestedObjectValue(record, ["thumbnails", "preview", "poster"]);

  const explicitType = normalizeString(record.type).toLowerCase();
  const type =
    explicitType === "video" || explicitType === "image"
      ? explicitType
      : inferMediaType(src, fallbackType);

  return {
    type,
    src,
    alt: normalizeString(record.alt) || normalizeString(record.alt_text) || alt,
    thumbnailSrc: thumbnailSrc && isSafeMediaUrl(thumbnailSrc) ? thumbnailSrc : undefined,
  };
}

function normalizeMediaCollection(
  value: unknown,
  fallbackType: ProductReviewMedia["type"],
  alt: string
) {
  const collection = Array.isArray(value)
    ? value
    : typeof value === "string" && value.includes(",")
      ? value.split(",")
      : value
        ? [value]
        : [];

  return collection
    .map((item) => normalizeMediaItem(item, fallbackType, alt))
    .filter((item): item is ProductReviewMedia => Boolean(item));
}

function normalizeReviewMedia(review: JudgeMeReview, alt: string) {
  const media = [
    ...normalizeMediaCollection(review.pictures, "image", alt),
    ...normalizeMediaCollection(review.picture_urls, "image", alt),
    ...normalizeMediaCollection(review.videos, "video", alt),
    ...normalizeMediaCollection(review.video_urls, "video", alt),
  ];

  const uniqueSources = new Set<string>();

  return media.filter((item) => {
    if (uniqueSources.has(item.src)) return false;
    uniqueSources.add(item.src);
    return true;
  });
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
    media: normalizeReviewMedia(review, `${author}'s review media`),
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

  const allReviews: JudgeMeReview[] = [];
  let page = 1;

  while (true) {
    const params = new URLSearchParams({
      api_token: config.apiToken,
      shop_domain: normalizeDomain(config.shopDomain),
      per_page: "100",
      page: String(page),
      published: "true",
    });

    const data = await judgeMeFetch<JudgeMeReviewsResponse>(`/reviews?${params}`);
    const reviews = Array.isArray(data.reviews) ? data.reviews : [];

    if (reviews.length === 0) break;
    allReviews.push(...reviews);
    if (reviews.length < 100) break;
    page++;
  }

  return allReviews
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
