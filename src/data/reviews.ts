import type { ProductReview } from "@/types";

export const SEEDED_PRODUCT_REVIEWS: ProductReview[] = [
  {
    id: 1,
    author: "Emily R.",
    location: "Phoenix, AZ",
    product: "Lumina · Anthracite · 100×150cm",
    rating: 5,
    date: "2026-04-18",
    title: "Clean fit and strong light control",
    content:
      "The shade arrived well packaged and fit the window neatly. It cuts the Arizona morning sun down a lot, and the finish looks clean in our bedroom.",
    verified: true,
  },
  {
    id: 2,
    author: "Mark T.",
    location: "New York, NY",
    product: "Lumina · Cream · 80×120cm",
    rating: 5,
    date: "2026-03-31",
    title: "Straightforward installation",
    content:
      "Installation was straightforward, and the tension fit feels secure. We used it in our guest room, and the difference in light control was immediate.",
    verified: true,
  },
  {
    id: 3,
    author: "Ryan K.",
    location: "Spring Valley, NV",
    product: "Lumina · Anthracite · 120×180cm",
    rating: 5,
    date: "2026-03-09",
    title: "Good rental-friendly option",
    content:
      "Great option for our rental because it did not require drilling. The shade feels solid, and the color matched the product photos closely.",
    verified: true,
  },
  {
    id: 4,
    author: "Jessica M.",
    location: "Chicago, IL",
    product: "Lumina · White · 60×90cm",
    rating: 5,
    date: "2026-02-17",
    title: "Minimal look from outside",
    content:
      "It sits neatly against the frame and looks minimal from the street. The white finish is exactly what I expected from the photos.",
    verified: true,
  },
  {
    id: 5,
    author: "Amanda B.",
    location: "Glendale, AZ",
    product: "Lumina · White · Custom",
    rating: 5,
    date: "2026-01-26",
    title: "Custom size matched well",
    content:
      "The custom size matched our window recess well, and the shade looks tidy once installed. It has made our bedroom noticeably darker at night.",
    verified: true,
  },
  {
    id: 6,
    author: "Chris W.",
    location: "Boston, MA",
    product: "Lumina · Cream · 140×200cm",
    rating: 5,
    date: "2025-12-14",
    title: "Better room darkening",
    content:
      "Delivery was quick, and the shade was easy to set up. It gives us much better room darkening than the old roller shade we had before.",
    verified: true,
  },
];

export function getReviewSummary(reviews: ProductReview[]) {
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount;

  return {
    averageRating,
    reviewCount,
  };
}
