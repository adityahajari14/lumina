
"use client";

import { useEffect, useState } from "react";
import type { ProductReview } from "@/types";

const PRODUCT_ID = "gid://shopify/Product/8894906695837";
const PRODUCT_HANDLE = "blackout-blinds";

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 0L13.09 6.26L20 7.27L15 12.14L16.18 19.02L10 16.27L3.82 19.02L5 12.14L0 7.27L6.91 6.26L10 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ReviewMediaPreview({ review }: { review: ProductReview }) {
  const media = review.media?.[0];
  if (!media) return null;
  const alt = media.alt || `${review.author} review media`;
  return (
    <div className="w-full overflow-hidden rounded-[8px] border border-[#dbe0e6] bg-[#dbe0e6]">
      {media.type === "video" ? (
        <video className="aspect-[4/3] w-full object-cover" controls preload="metadata" poster={media.thumbnailSrc}>
          <source src={media.src} />
        </video>
      ) : (
        <img src={media.src} alt={alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
      )}
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams({ productId: PRODUCT_ID, productHandle: PRODUCT_HANDLE });
    fetch(`/api/reviews?${params}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((payload) => {
        if (!payload.success || !payload.data) return;
        setReviews(payload.data.reviews.slice(0, 6));
        setAverageRating(payload.data.averageRating);
        setReviewCount(payload.data.reviewCount);
      })
      .catch(() => {});
  }, []);

  if (reviews.length === 0) return null;

  const displayRating = averageRating > 0 ? averageRating.toFixed(1) : "4.9";

  return (
    <section id="reviews" className="bg-[#f9fafb] py-16 md:py-24 px-6 relative w-full">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-10 md:gap-14">
        {/* Header container */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 w-full">
          {/* Header left */}
          <div className="flex flex-col gap-4 max-w-[283px] w-full">
            <p className="font-[family-name:var(--font-dm-sans)] font-medium text-[#4051b5] text-xs tracking-[1.2px] uppercase">
              Reviews
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[#131720] text-4xl md:text-[48px] leading-tight md:leading-[48px] whitespace-nowrap">
              What our <br />
              <span className="font-normal italic">customers say</span>
            </h2>
          </div>

          {/* Header right (Overall rating) */}
          <div className="flex items-center gap-4 pb-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="text-[#131720] w-5 h-5 shrink-0" />
              ))}
            </div>
            <div className="flex flex-col items-start gap-px">
              <p className="font-[family-name:var(--font-playfair)] font-semibold text-[#131720] text-2xl leading-[32px]">
                {displayRating} / 5
              </p>
              <p className="font-[family-name:var(--font-dm-sans)] font-normal text-[#657186] text-xs leading-[16px]">
                from {reviewCount > 0 ? `${reviewCount} ` : ""}recent customer feedback
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-[#eaedf0] rounded-2xl flex flex-col gap-4 items-start p-7 self-start h-full"
            >
              {/* Card stars */}
              <div className="flex gap-1 w-full">
                {[...Array(review.rating)].map((_, idx) => (
                  <StarIcon key={idx} className="text-[#131720] w-3.5 h-3.5 shrink-0" />
                ))}
              </div>

              {/* Card text */}
              <div className="flex-grow pb-2 w-full">
                <p className="font-[family-name:var(--font-dm-sans)] font-normal text-[#131720] text-sm leading-[22.75px]">
                  &quot;{review.content}&quot;
                </p>
              </div>

              <ReviewMediaPreview review={review} />

              {/* Card footer (User details) */}
              <div className="border-t border-[#dbe0e6] pt-3 flex gap-3 items-center w-full">
                {/* Avatar */}
                <div className="relative w-9 h-9 shrink-0 rounded-full overflow-hidden bg-[#dbe0e6] flex items-center justify-center">
                  <span className="font-[family-name:var(--font-playfair)] font-semibold text-[#131720] text-sm leading-none">
                    {review.author.charAt(0)}
                  </span>
                </div>

                {/* Info Text */}
                <div className="flex flex-col gap-0.5 items-start">
                  <p className="font-[family-name:var(--font-dm-sans)] text-sm leading-5">
                    <span className="font-medium text-[#131720]">{review.author}</span>
                  </p>
                  <p className="font-[family-name:var(--font-dm-sans)] font-normal text-[#657186] text-xs leading-4">
                    {review.product || review.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
