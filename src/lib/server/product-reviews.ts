import { getReviewSummary } from "@/data/reviews";
import { fetchJudgeMeReviews, isJudgeMeConfigured } from "@/lib/server/judgeme";
import type { Product, ProductReview, ProductReviewsData } from "@/types";

export function buildProductReviewsData(
  reviews: ProductReview[],
  source: ProductReviewsData["source"] = "judgeme"
): ProductReviewsData {
  const summary = getReviewSummary(reviews);

  return {
    reviews,
    averageRating: summary.averageRating,
    reviewCount: summary.reviewCount,
    source,
    syncEnabled: isJudgeMeConfigured(),
  };
}

export async function getProductReviewsData(product: Pick<Product, "id" | "slug">) {
  try {
    const reviews =
      (await fetchJudgeMeReviews({
        id: product.id,
        handle: product.slug,
      })) ?? [];

    return buildProductReviewsData(reviews);
  } catch (error) {
    console.error("[ProductReviewsInitialFetch]", error);
    return buildProductReviewsData([]);
  }
}
