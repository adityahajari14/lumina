"use client";

import { useEffect } from "react";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductFeatures from "./ProductFeatures";
import ProductKeyFeatures from "./ProductKeyFeatures";
import ProductWhyLumina from "./ProductWhyLumina";
import ProductReviews from "./ProductReviews";
import { trackClarityProductView } from "@/lib/clarity";
import { trackViewContent } from "@/lib/meta-pixel";
import { trackShopifyProductView } from "@/lib/shopify-analytics";
import type { Product, ProductReviewsData } from "@/types";

interface ProductPageProps {
  product: Product;
  initialReviewsData: ProductReviewsData;
}

export default function ProductPage({ product, initialReviewsData }: ProductPageProps) {
  useEffect(() => {
    trackClarityProductView(product);
    trackViewContent(product);
    trackShopifyProductView(product);
  }, [product]);

  return (
    <div className="w-full flex flex-col">
      <div className="w-full min-h-screen bg-white pt-10 md:pt-15 pb-12 md:pb-20">
      <div className="max-w-[1248px] mx-auto px-4 md:px-8 xl:px-0 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[64px]">
        {/* Left Side - Sticky Gallery */}
        <div className="relative w-full self-start lg:sticky lg:top-[max(1rem,calc(50vh-22rem))]">
          <div>
            <ProductGallery product={product} />
          </div>
        </div>

        {/* Right Side - Product Info */}
        <div className="w-full pt-2">
          <ProductInfo product={product} initialReviewsData={initialReviewsData} />
        </div>
      </div>
      </div>

      {/* Key Features Section below */}
      <ProductKeyFeatures />

      {/* Features Section below */}
      <ProductFeatures />

      {/* Why Lumina Section below */}
      <ProductWhyLumina />

      <ProductReviews product={product} initialReviewsData={initialReviewsData} />
    </div>
  );
}
