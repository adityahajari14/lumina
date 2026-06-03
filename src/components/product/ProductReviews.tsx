"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { SEEDED_PRODUCT_REVIEWS, getReviewSummary } from "@/data/reviews";
import type { Product, ProductReview } from "@/types";

interface ProductReviewsProps {
  product: Product;
}

interface ReviewsApiResponse {
  success: boolean;
  data?: {
    reviews: ProductReview[];
    averageRating: number;
    reviewCount: number;
    source: "judgeme" | "seeded";
    syncEnabled: boolean;
  };
  error?: {
    message: string;
  };
}

const INITIAL_SUMMARY = getReviewSummary(SEEDED_PRODUCT_REVIEWS);
const REVIEWS_PER_PAGE = 4;

function StarIcon({ filled = true, className = "" }: { filled?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
    >
      <path
        d="M10 1.5l2.58 5.23 5.77.84-4.17 4.06.98 5.74L10 14.65l-5.16 2.72.98-5.74L1.65 7.57l5.77-.84L10 1.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RatingStars({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5 text-[#b7791f]" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} filled={rating >= star - 0.25} className={`${size} shrink-0`} />
      ))}
    </div>
  );
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function ProductReviews({ product }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>(SEEDED_PRODUCT_REVIEWS);
  const [averageRating, setAverageRating] = useState(INITIAL_SUMMARY.averageRating);
  const [reviewCount, setReviewCount] = useState(INITIAL_SUMMARY.reviewCount);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [visibleReviewCount, setVisibleReviewCount] = useState(REVIEWS_PER_PAGE);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    rating: 5,
    title: "",
    body: "",
  });

  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams({
      productId: product.id,
      productHandle: product.slug,
    });

    const loadReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?${params}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as ReviewsApiResponse;

        if (!isMounted || !payload.success || !payload.data) return;

        setReviews(payload.data.reviews);
        setAverageRating(payload.data.averageRating);
        setReviewCount(payload.data.reviewCount);
        setSyncEnabled(payload.data.syncEnabled);
      } catch (error) {
        console.error("Failed to load product reviews:", error);
      }
    };

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [product.id, product.slug]);

  const ratingBreakdown = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((rating) => {
        const count = reviews.filter((review) => Math.round(review.rating) === rating).length;
        return {
          rating,
          count,
          percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0,
        };
      }),
    [reviews]
  );

  const visibleReviews = reviews.slice(0, visibleReviewCount);
  const hasMoreReviews = visibleReviewCount < reviews.length;

  const updateForm = (updates: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage(null);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productHandle: product.slug,
          ...form,
        }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        data?: { review: ProductReview };
        error?: { message: string };
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error?.message || "Unable to submit your review right now.");
      }

      const nextReviews = [payload.data.review, ...reviews];
      const nextSummary = getReviewSummary(nextReviews);
      setReviews(nextReviews);
      setAverageRating(nextSummary.averageRating);
      setReviewCount(nextSummary.reviewCount);
      setForm({ name: "", email: "", rating: 5, title: "", body: "" });
      setSubmitMessage("Thanks. Your review has been submitted.");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to submit your review right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="product-reviews" className="w-full bg-white px-4 py-14 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14">
        <aside className="flex flex-col gap-7 lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col gap-3">
            <h2 className="font-sans text-[24px] font-semibold leading-tight text-[#131720]">
              Rating snapshot
            </h2>
            <div className="flex items-center gap-3">
              <RatingStars rating={averageRating} size="h-5 w-5" />
              <span className="font-sans text-[15px] text-[#131720]">
                {averageRating.toFixed(1)} out of 5
              </span>
            </div>
            <p className="font-sans text-[13px] text-[#657186]">
              {reviewCount} global {reviewCount === 1 ? "rating" : "ratings"}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {ratingBreakdown.map((item) => (
              <div key={item.rating} className="grid grid-cols-[46px_1fr_38px] items-center gap-2">
                <span className="font-sans text-[13px] text-[#2563a8]">{item.rating} star</span>
                <div className="h-5 overflow-hidden rounded-[4px] border border-[#d5d9d9] bg-[#f0f2f2]">
                  <div className="h-full bg-[#b7791f]" style={{ width: `${item.percentage}%` }} />
                </div>
                <span className="text-right font-sans text-[13px] text-[#2563a8]">
                  {Math.round(item.percentage)}%
                </span>
              </div>
            ))}
          </div>

        </aside>

        <div className="flex flex-col gap-7">
          <div className="rounded-[8px] border border-[#dbe0e6] bg-[#f9fafb] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-sans text-[20px] font-semibold text-[#131720]">
                  Customer reviews
                </h3>
                <p className="mt-1 font-sans text-[13px] text-[#657186]">
                  Read feedback from customers and share your own experience.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(true);
                  setSubmitError(null);
                  setSubmitMessage(null);
                }}
                className="w-full cursor-pointer rounded-full bg-[#131720] px-5 py-2.5 font-sans text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-black sm:w-auto"
              >
                Write a review
              </button>
            </div>
          </div>

          {showReviewForm && (
            <form className="flex flex-col gap-4 rounded-[8px] border border-[#dbe0e6] bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
              <div className="border-b border-[#eaedf0] pb-4">
                <h4 className="font-sans text-[16px] font-semibold text-[#131720]">
                  Tell us what you think
                </h4>
                <p className="mt-1 font-sans text-[12px] leading-5 text-[#657186]">
                  Your review helps other shoppers make a better decision.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-sans text-[13px] text-[#657186]" id="review-rating-label">
                  Overall rating
                </span>
                <div
                  className="flex items-center justify-between gap-4 rounded-[8px] border border-[#dbe0e6] bg-white px-3 py-2.5 transition-colors focus-within:border-[#131720]"
                  role="radiogroup"
                  aria-labelledby="review-rating-label"
                  onMouseLeave={() => setHoveredRating(null)}
                >
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => {
                      const activeRating = hoveredRating ?? form.rating;
                      const isActive = activeRating >= rating;

                      return (
                        <button
                          key={rating}
                          type="button"
                          role="radio"
                          aria-checked={form.rating === rating}
                          aria-label={`${rating} ${rating === 1 ? "star" : "stars"}`}
                          onMouseEnter={() => setHoveredRating(rating)}
                          onFocus={() => setHoveredRating(rating)}
                          onBlur={() => setHoveredRating(null)}
                          onClick={() => updateForm({ rating })}
                          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#f0f2f2] focus:outline-none focus:ring-2 focus:ring-[#131720] focus:ring-offset-2"
                        >
                          <StarIcon
                            filled={isActive}
                            className={`h-5 w-5 ${isActive ? "text-[#b7791f]" : "text-[#9aa3af]"}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="shrink-0 font-sans text-[13px] font-medium text-[#131720]">
                    {form.rating}.0
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="review-name" className="font-sans text-[13px] text-[#657186]">
                    Name
                  </label>
                  <input
                    id="review-name"
                    value={form.name}
                    onChange={(event) => updateForm({ name: event.target.value })}
                    className="rounded-[8px] border border-[#dbe0e6] bg-white px-3 py-2.5 text-sm text-[#131720] outline-none transition-colors focus:border-[#131720]"
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="review-email" className="font-sans text-[13px] text-[#657186]">
                    Email
                  </label>
                  <input
                    id="review-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateForm({ email: event.target.value })}
                    className="rounded-[8px] border border-[#dbe0e6] bg-white px-3 py-2.5 text-sm text-[#131720] outline-none transition-colors focus:border-[#131720]"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="review-title" className="font-sans text-[13px] text-[#657186]">
                  Add a headline
                </label>
                <input
                  id="review-title"
                  value={form.title}
                  onChange={(event) => updateForm({ title: event.target.value })}
                  className="rounded-[8px] border border-[#dbe0e6] bg-white px-3 py-2.5 text-sm text-[#131720] outline-none transition-colors focus:border-[#131720]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="review-body" className="font-sans text-[13px] text-[#657186]">
                  Write your review
                </label>
                <textarea
                  id="review-body"
                  value={form.body}
                  onChange={(event) => updateForm({ body: event.target.value })}
                  rows={4}
                  className="resize-none rounded-[8px] border border-[#dbe0e6] bg-white px-3 py-2.5 text-sm text-[#131720] outline-none transition-colors focus:border-[#131720]"
                  required
                />
              </div>

              {submitError && (
                <p className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                  {submitError}
                </p>
              )}
              {submitMessage && (
                <p className="rounded-[8px] border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700">
                  {submitMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !syncEnabled}
                className="w-full rounded-full bg-[#131720] py-3 font-sans text-[15px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-[#9aa3af]"
              >
                {isSubmitting ? "Submitting..." : "Submit review"}
              </button>

              {!syncEnabled && (
                <p className="font-sans text-[12px] leading-5 text-[#657186]">
                  Review syncing is not configured yet.
                </p>
              )}
            </form>
          )}

          <div className="divide-y divide-[#eaedf0]">
            {visibleReviews.map((review) => (
              <article key={review.id} className="py-6 first:pt-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dbe0e6]">
                    <span className="font-sans text-[13px] font-semibold text-[#131720]">
                      {review.author.charAt(0)}
                    </span>
                  </div>
                  <p className="font-sans text-[13px] text-[#131720]">{review.author}</p>
                </div>

                <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <RatingStars rating={review.rating} />
                  <h4 className="font-sans text-[14px] font-semibold text-[#131720]">
                    {review.title}
                  </h4>
                </div>

                <p className="mt-1 font-sans text-[12px] text-[#657186]">
                  {formatReviewDate(review.date)}
                </p>

                <p className="mt-3 max-w-[720px] font-sans text-[14px] leading-6 text-[#384152]">
                  {review.content}
                </p>
              </article>
            ))}
          </div>

          {hasMoreReviews && (
            <button
              type="button"
              onClick={() => setVisibleReviewCount((count) => count + REVIEWS_PER_PAGE)}
              className="self-start rounded-full border border-[#b8bec7] bg-white px-5 py-2.5 font-sans text-[14px] text-[#131720] shadow-sm transition-colors hover:bg-[#f7f8f8]"
            >
              View more reviews
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
