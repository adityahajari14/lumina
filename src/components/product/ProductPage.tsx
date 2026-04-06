"use client";

import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductFeatures from "./ProductFeatures";
import ProductWhyLumina from "./ProductWhyLumina";
import type { Product } from "@/types";

interface ProductPageProps {
  product: Product;
}

export default function ProductPage({ product }: ProductPageProps) {
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
          <ProductInfo product={product} />
        </div>
      </div>
      </div>

      {/* Features Section below */}
      <ProductFeatures />

      {/* Why Lumina Section below */}
      <ProductWhyLumina />
    </div>
  );
}
