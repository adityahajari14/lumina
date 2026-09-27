import ProductReviews from "@/components/product/ProductReviews";
import { getBlackoutProduct } from "@/lib/blackout-product";
import { getProductReviewsData } from "@/lib/server/product-reviews";

export default async function Reviews() {
  const product = await getBlackoutProduct().catch(() => null);
  if (!product) return null;
  const initialReviewsData = await getProductReviewsData(product);

  if (initialReviewsData.reviews.length === 0) return null;

  return (
    <ProductReviews
      product={product}
      initialReviewsData={initialReviewsData}
      sectionId="reviews"
      showWriteReview={false}
    />
  );
}
