import type { ProductReview } from "@/types";

export const SEEDED_PRODUCT_REVIEWS: ProductReview[] = [
  {
    id: 1,
    author: "Emily R.",
    location: "Phoenix, AZ",
    product: "Lumina · Graphite · 100×150cm",
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
    product: "Lumina · Graphite · 120×180cm",
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

export const DEMO_PRODUCT_REVIEWS: ProductReview[] = [
  {
    id: 1001,
    author: "Rachel M.",
    location: "Austin, TX",
    product: "Lumina · Graphite · Custom fit",
    rating: 5,
    date: "2026-05-21",
    title: "Bedroom is finally dark in the morning",
    content:
      "We installed this in our east-facing bedroom and the difference was immediate. The side channels sit neatly against the frame, and there is barely any glow around the edges now.",
    verified: true,
    isDemo: true,
    media: [
      {
        type: "image",
        src: "/product/gallery-1.webp",
        alt: "Demo review photo showing a fitted Lumina blackout blind",
      },
    ],
  },
  {
    id: 1002,
    author: "Daniel P.",
    location: "Seattle, WA",
    product: "Lumina · White · 72×60 in",
    rating: 5,
    date: "2026-05-14",
    title: "Looks built in",
    content:
      "The blind looks much cleaner than our old blackout curtain. It took a little patience to measure twice, but once fitted it feels sturdy and the white frame blends in with the trim.",
    verified: true,
    isDemo: true,
    media: [
      {
        type: "image",
        src: "/product/gallery-2.webp",
        alt: "Demo review photo of a white blackout blind in a window recess",
      },
    ],
  },
  {
    id: 1003,
    author: "Priya S.",
    location: "Jersey City, NJ",
    product: "Lumina · Cream · Custom fit",
    rating: 5,
    date: "2026-05-02",
    title: "Great for a nursery",
    content:
      "We bought this for our baby's room and naps are much easier now. The material feels premium, and the room stays noticeably cooler during the afternoon sun.",
    verified: true,
    isDemo: true,
    media: [
      {
        type: "video",
        src: "/product/blackout.mp4",
        thumbnailSrc: "/product/gallery-3.webp",
        alt: "Demo review video showing blackout performance",
      },
    ],
  },
  {
    id: 1004,
    author: "Michael B.",
    location: "Denver, CO",
    product: "Lumina · Graphite · 58×48 in",
    rating: 4,
    date: "2026-04-28",
    title: "Very dark, very tidy",
    content:
      "The finished look is excellent and the blackout effect is much better than roller shades we tried before. Installation was simple, though having a second person helped line everything up.",
    verified: true,
    isDemo: true,
    media: [
      {
        type: "image",
        src: "/product/gallery-4.webp",
        alt: "Demo review photo showing side-channel blackout coverage",
      },
    ],
  },
  {
    id: 1005,
    author: "Lauren C.",
    location: "Scottsdale, AZ",
    product: "Lumina · White · Custom fit",
    rating: 5,
    date: "2026-04-19",
    title: "Huge upgrade for hot afternoons",
    content:
      "Our room used to heat up fast after lunch. This blind blocks the harsh light and makes the space feel calmer without making the window look bulky.",
    verified: true,
    isDemo: true,
    media: [
      {
        type: "image",
        src: "/product/gallery-5.webp",
        alt: "Demo review photo of a blackout blind in bright daylight",
      },
    ],
  },
  {
    id: 1006,
    author: "Evan T.",
    location: "Brooklyn, NY",
    product: "Lumina · Cream · 48×72 in",
    rating: 5,
    date: "2026-04-11",
    title: "Perfect for street lights",
    content:
      "The apartment has a street lamp right outside the window, and this solved it better than expected. The blind moves smoothly and the fabric has a nice matte finish.",
    verified: true,
    isDemo: true,
  },
  {
    id: 1007,
    author: "Natalie W.",
    location: "Portland, OR",
    product: "Lumina · Graphite · Custom fit",
    rating: 5,
    date: "2026-03-30",
    title: "Good no-drama install",
    content:
      "The instructions were clear and the pieces felt well made. We fitted two windows in the guest room, and both came out looking precise.",
    verified: true,
    isDemo: true,
    media: [
      {
        type: "image",
        src: "/product/gallery-6.webp",
        alt: "Demo review photo of installed blackout blinds in a guest room",
      },
      {
        type: "image",
        src: "/product/gallery-7.webp",
        alt: "Demo review close-up of blackout blind frame",
      },
    ],
  },
  {
    id: 1008,
    author: "Carlos R.",
    location: "Miami, FL",
    product: "Lumina · White · 60×60 in",
    rating: 4,
    date: "2026-03-22",
    title: "Clean finish and solid blackout",
    content:
      "The room gets dark enough for shift-work sleep, which was the main goal. The only slow part was trimming the final alignment, but the result looks professional.",
    verified: true,
    isDemo: true,
  },
  {
    id: 1009,
    author: "Hannah J.",
    location: "Minneapolis, MN",
    product: "Lumina · Cream · Custom fit",
    rating: 5,
    date: "2026-03-08",
    title: "Better than blackout curtains",
    content:
      "I wanted something that did not collect dust or cover the whole wall. This sits inside the window neatly and gives a much cleaner look.",
    verified: true,
    isDemo: true,
    media: [
      {
        type: "image",
        src: "/product/gallery-8.webp",
        alt: "Demo review photo comparing a fitted blackout blind with room decor",
      },
    ],
  },
  {
    id: 1010,
    author: "Jason L.",
    location: "San Diego, CA",
    product: "Lumina · Graphite · 72×72 in",
    rating: 5,
    date: "2026-02-26",
    title: "Really polished product",
    content:
      "Everything arrived packed well, and the finish looks more premium than I expected. It blocks the morning light and still looks minimal from inside the room.",
    verified: true,
    isDemo: true,
    media: [
      {
        type: "image",
        src: "/product/gallery-9.webp",
        alt: "Demo review photo of anthracite blackout blind installed",
      },
    ],
  },
  {
    id: 1011,
    author: "Sophie K.",
    location: "Nashville, TN",
    product: "Lumina · White · Custom fit",
    rating: 5,
    date: "2026-02-18",
    title: "Guest room feels hotel dark",
    content:
      "Guests have already commented on how dark the room gets. The frame feels secure, and the blind has a quiet, smooth pull.",
    verified: true,
    isDemo: true,
  },
  {
    id: 1012,
    author: "Owen F.",
    location: "Raleigh, NC",
    product: "Lumina · Cream · 54×48 in",
    rating: 4,
    date: "2026-02-03",
    title: "Accurate custom sizing",
    content:
      "The custom dimensions were accurate and it fitted the recess nicely. I would recommend measuring carefully, because the snug fit is what makes it work so well.",
    verified: true,
    isDemo: true,
    media: [
      {
        type: "image",
        src: "/product/gallery-10.webp",
        alt: "Demo review photo showing a custom-size blackout blind",
      },
    ],
  },
  {
    id: 1013,
    author: "Megan A.",
    location: "Columbus, OH",
    product: "Lumina · Graphite · Custom fit",
    rating: 5,
    date: "2026-01-21",
    title: "Noticeably quieter and darker",
    content:
      "Besides the blackout, the room feels a little more insulated from outside light and drafts. It is a tidy upgrade over the temporary shade we had before.",
    verified: true,
    isDemo: true,
  },
  {
    id: 1014,
    author: "Tyler N.",
    location: "Charlotte, NC",
    product: "Lumina · White · 46×70 in",
    rating: 5,
    date: "2026-01-10",
    title: "Great for a media room",
    content:
      "We put this in the media room and daytime glare is gone. The blind disappears into the frame when raised, which keeps the room looking clean.",
    verified: true,
    isDemo: true,
    media: [
      {
        type: "video",
        src: "/product/blackout.mp4",
        thumbnailSrc: "/product/gallery-1.webp",
        alt: "Demo review video of a blackout blind in use",
      },
    ],
  },
  {
    id: 1015,
    author: "Alicia D.",
    location: "Tampa, FL",
    product: "Lumina · Cream · Custom fit",
    rating: 5,
    date: "2025-12-18",
    title: "Worth it for the clean look",
    content:
      "The biggest win is how finished it looks compared with layered curtains. It keeps the bedroom dark, and the cream color works well with our walls.",
    verified: true,
    isDemo: true,
    media: [
      {
        type: "image",
        src: "/product/energy-efficient.webp",
        alt: "Demo review photo of a room with Lumina blackout blinds",
      },
    ],
  },
];

export const ACTIVE_PRODUCT_REVIEWS =
  process.env.NEXT_PUBLIC_USE_DEMO_REVIEWS === "true"
    ? DEMO_PRODUCT_REVIEWS
    : SEEDED_PRODUCT_REVIEWS;

export function getFallbackReviewSource() {
  return process.env.NEXT_PUBLIC_USE_DEMO_REVIEWS === "true" ? "demo" : "seeded";
}

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
