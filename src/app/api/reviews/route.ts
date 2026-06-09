import { NextResponse } from "next/server";
import { buildProductReviewsData } from "@/lib/server/product-reviews";
import {
  createJudgeMeReview,
  fetchJudgeMeReviews,
  isJudgeMeConfigured
} from "@/lib/server/judgeme";
import type { ProductReview, ProductReviewsData } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

interface ReviewSubmissionBody {
  productId?: unknown;
  productHandle?: unknown;
  name?: unknown;
  email?: unknown;
  rating?: unknown;
  title?: unknown;
  body?: unknown;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeInput(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getProductRefFromRequest(request: Request) {
  const url = new URL(request.url);
  return {
    id: url.searchParams.get("productId") || "",
    handle: url.searchParams.get("productHandle") || "",
  };
}

function buildReviewsResponse(
  reviews: ProductReview[],
  source: ProductReviewsData["source"]
): ProductReviewsData {
  return buildProductReviewsData(reviews, source);
}

export async function GET(request: Request) {
  const product = getProductRefFromRequest(request);

  try {
    const judgeMeReviews = await fetchJudgeMeReviews(product);
    const reviews = judgeMeReviews ?? [];

    return NextResponse.json<ApiResponse<ProductReviewsData>>({
      success: true,
      data: buildReviewsResponse(reviews, "judgeme"),
    });
  } catch (error) {
    console.error("[ProductReviewsFetch]", error);

    return NextResponse.json<ApiResponse<ProductReviewsData>>({
      success: true,
      data: buildReviewsResponse([], "judgeme"),
    });
  }
}

export async function POST(request: Request) {
  try {
    if (!isJudgeMeConfigured()) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { message: "Review syncing is not configured yet." },
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as ReviewSubmissionBody;
    const productId = normalizeInput(body.productId);
    const productHandle = normalizeInput(body.productHandle);
    const name = normalizeInput(body.name);
    const email = normalizeInput(body.email);
    const title = normalizeInput(body.title);
    const reviewBody = normalizeInput(body.body);
    const rating = Number(body.rating);

    if (!productId || !productHandle) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { message: "Product information is required." },
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { message: "Please enter your name." },
        },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { message: "Please enter a valid email address." },
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { message: "Please select a rating from 1 to 5." },
        },
        { status: 400 }
      );
    }

    if (reviewBody.length < 10) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { message: "Please write a review of at least 10 characters." },
        },
        { status: 400 }
      );
    }

    const review = await createJudgeMeReview({
      id: productId,
      handle: productHandle,
      name,
      email,
      rating,
      title,
      body: reviewBody,
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    });

    return NextResponse.json<ApiResponse<{ review: ProductReview }>>(
      {
        success: true,
        data: { review },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ProductReviewsSubmit]", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit your review right now.";

    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { message },
      },
      { status: 500 }
    );
  }
}
