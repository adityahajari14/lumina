"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import SaleCountdown from "@/components/common/SaleCountdown";
import { useCart } from "@/context/CartContext";
import { calculateTotalPrice, configToCustomizations, getTotalInches } from "@/lib/pricing";
import { getComparePriceData } from "@/lib/compare-price";
import { fetchCustomizationPricing, fetchPriceMatrix, formatPriceWithCurrency, validateCartPrice } from "@/lib/api";
import { getReviewSummary } from "@/data/reviews";
import {
  BLIND_COLOR_OPTIONS,
  FRAME_COLOR_OPTIONS,
  OPENING_DIRECTION_OPTIONS,
} from "@/data/customizations";
import type {
  CustomizationPricing,
  PriceBandMatrix,
  Product,
  ProductConfiguration,
  ProductReviewsData,
} from "@/types";
import { DEFAULT_CONFIGURATION } from "@/types";
import ProductAccordion from "@/components/product/ProductAccordion";

const PROMO_CODE = "FINAL15";

interface ProductInfoProps {
  product: Product;
  initialReviewsData?: ProductReviewsData;
}

const INITIAL_REVIEW_SUMMARY = getReviewSummary([]);

interface ReviewsSummaryResponse {
  success: boolean;
  data?: {
    averageRating: number;
    reviewCount: number;
  };
}

function ProductRatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-[#b7791f]" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={rating >= star - 0.25 ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      ))}
    </div>
  );
}

export default function ProductInfo({ product, initialReviewsData }: ProductInfoProps) {
  const { addToCart } = useCart();
  const addToCartRef = useRef<HTMLButtonElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [pricingLoaded, setPricingLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [priceMatrix, setPriceMatrix] = useState<PriceBandMatrix | null>(null);
  const [customizationPricing, setCustomizationPricing] = useState<CustomizationPricing[]>([]);
  const [ratingSummary, setRatingSummary] = useState({
    averageRating:
      initialReviewsData?.averageRating ?? product.rating ?? INITIAL_REVIEW_SUMMARY.averageRating,
    reviewCount:
      initialReviewsData?.reviewCount ?? product.reviewCount ?? INITIAL_REVIEW_SUMMARY.reviewCount,
  });
  const [config, setConfig] = useState<ProductConfiguration>({
    ...DEFAULT_CONFIGURATION,
    width: 0,
    height: 0,
    widthUnit: "inches",
    heightUnit: "inches",
    blindColor: null,
    frameColor: null,
    openingDirection: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadPricing = async () => {
      try {
        const [matrix, customizations] = await Promise.all([
          fetchPriceMatrix(product.slug),
          fetchCustomizationPricing(),
        ]);

        if (!isMounted) return;

        setPriceMatrix(matrix);
        setCustomizationPricing(customizations);
      } catch (error) {
        console.error("Failed to load pricing data:", error);
      } finally {
        if (isMounted) {
          setPricingLoaded(true);
        }
      }
    };

    loadPricing();

    return () => {
      isMounted = false;
    };
  }, [product.slug]);

  useEffect(() => {
    if (initialReviewsData) {
      setRatingSummary({
        averageRating: initialReviewsData.averageRating,
        reviewCount: initialReviewsData.reviewCount,
      });
      return;
    }

    let isMounted = true;
    const params = new URLSearchParams({
      productId: product.id,
      productHandle: product.slug,
    });

    const loadRatingSummary = async () => {
      try {
        const response = await fetch(`/api/reviews?${params}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as ReviewsSummaryResponse;

        if (!isMounted || !payload.success || !payload.data) return;

        setRatingSummary({
          averageRating: payload.data.averageRating,
          reviewCount: payload.data.reviewCount,
        });
      } catch (error) {
        console.error("Failed to load product rating summary:", error);
      }
    };

    loadRatingSummary();

    return () => {
      isMounted = false;
    };
  }, [initialReviewsData, product.id, product.slug]);

  useEffect(() => {
    const button = addToCartRef.current;
    if (!button) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(button);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("sticky-bar-visible", showStickyBar);
    return () => document.body.classList.remove("sticky-bar-visible");
  }, [showStickyBar]);

  const selectedCustomizations = useMemo(
    () =>
      configToCustomizations({
        blindColor: config.blindColor,
        frameColor: config.frameColor,
        openingDirection: config.openingDirection,
      }),
    [config.blindColor, config.frameColor, config.openingDirection]
  );

  const totalPrice = useMemo(() => {
    const widthInches = getTotalInches(config.width, config.widthFraction, config.widthUnit);
    const heightInches = getTotalInches(config.height, config.heightFraction, config.heightUnit);

    if (!priceMatrix || widthInches <= 0 || heightInches <= 0) {
      return product.price;
    }

    return (
      calculateTotalPrice(
        widthInches,
        heightInches,
        priceMatrix,
        selectedCustomizations,
        customizationPricing
      )?.totalPrice ?? product.price
    );
  }, [
    config.height,
    config.heightFraction,
    config.heightUnit,
    config.width,
    config.widthFraction,
    config.widthUnit,
    customizationPricing,
    priceMatrix,
    product.price,
    selectedCustomizations,
  ]);

  const { compareAtPrice: comparePrice, upliftPercent } = useMemo(() => getComparePriceData(totalPrice), [totalPrice]);
  const savings = useMemo(() => Math.round(comparePrice - totalPrice), [comparePrice, totalPrice]);
  const [promoCopied, setPromoCopied] = useState(false);

  const handlePromoCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setPromoCopied(true);
      window.setTimeout(() => setPromoCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const sizeRanges = useMemo(() => {
    if (!priceMatrix || priceMatrix.widthBands.length === 0 || priceMatrix.heightBands.length === 0) {
      return null;
    }

    const minWidth = Math.min(...priceMatrix.widthBands.map((band) => band.inches));
    const maxWidth = Math.max(...priceMatrix.widthBands.map((band) => band.inches));
    const minHeight = Math.min(...priceMatrix.heightBands.map((band) => band.inches));
    const maxHeight = Math.max(...priceMatrix.heightBands.map((band) => band.inches));

    return {
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
    };
  }, [priceMatrix]);

  const unit = config.widthUnit === "cm" ? "cm" : "in";

  const widthLimits = useMemo(() => {
    if (unit === "in") {
      const min = sizeRanges?.minWidth ?? 20;
      const max = sizeRanges?.maxWidth ?? 157;
      return { min, max, placeholder: `${min}-${max}` };
    }

    const min = sizeRanges?.minWidth ? Math.round(sizeRanges.minWidth * 2.54) : 50;
    const max = sizeRanges?.maxWidth ? Math.round(sizeRanges.maxWidth * 2.54) : 400;
    return { min, max, placeholder: `${min}-${max}` };
  }, [sizeRanges, unit]);

  const heightLimits = useMemo(() => {
    if (unit === "in") {
      const min = sizeRanges?.minHeight ?? 20;
      const max = sizeRanges?.maxHeight ?? 118;
      return { min, max, placeholder: `${min}-${max}` };
    }

    const min = sizeRanges?.minHeight ? Math.round(sizeRanges.minHeight * 2.54) : 50;
    const max = sizeRanges?.maxHeight ? Math.round(sizeRanges.maxHeight * 2.54) : 300;
    return { min, max, placeholder: `${min}-${max}` };
  }, [sizeRanges, unit]);

  const updateMeasurementUnit = (nextUnit: "cm" | "in") => {
    setConfig((prev) => ({
      ...prev,
      widthUnit: nextUnit === "cm" ? "cm" : "inches",
      heightUnit: nextUnit === "cm" ? "cm" : "inches",
    }));
  };

  const selectedBlindColor = BLIND_COLOR_OPTIONS.find((color) => color.id === config.blindColor);
  const selectedFrameColor = FRAME_COLOR_OPTIONS.find((color) => color.id === config.frameColor);
  const selectedOpeningDirection = OPENING_DIRECTION_OPTIONS.find(
    (direction) => direction.id === config.openingDirection
  );

  const hasValidSize =
    !product.features.hasSize ||
    (config.width >= widthLimits.min &&
      config.width <= widthLimits.max &&
      config.height >= heightLimits.min &&
      config.height <= heightLimits.max);

  const hasRequiredCustomizations =
    (!product.features.hasBlindColor || Boolean(config.blindColor)) &&
    (!product.features.hasFrameColor || Boolean(config.frameColor)) &&
    (!product.features.hasOpeningDirection || Boolean(config.openingDirection));

  const isAddToCartDisabled =
    isAddingToCart || !pricingLoaded || !hasValidSize || !hasRequiredCustomizations;

  const handleAddToCart = async () => {
    if (isAddToCartDisabled) return;

    setIsAddingToCart(true);

    try {
      const widthInches = getTotalInches(config.width, config.widthFraction, config.widthUnit);
      const heightInches = getTotalInches(config.height, config.heightFraction, config.heightUnit);

      const validation = await validateCartPrice(
        {
          handle: product.slug,
          widthInches,
          heightInches,
          customizations: selectedCustomizations,
        },
        totalPrice
      );

      addToCart(
        {
          ...product,
          price: validation.valid ? totalPrice : validation.calculatedPrice,
        },
        config
      );
    } catch (error) {
      console.error("Price validation failed:", error);
      addToCart(
        {
          ...product,
          price: totalPrice,
        },
        config
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[600px] pb-16">
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <h1 className="font-playfair font-medium text-[#131720] text-[32px] leading-tight lg:text-[40px]">
          {product.name}
        </h1>
        {product.descriptionHtml && product.descriptionHtml !== product.name ? (
          <div
            className="max-w-[560px] font-sans text-[15px] leading-6 text-[#657186] [&_li]:mb-1 [&_li]:pl-1 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        ) : null}
        <div className="flex items-center text-sm gap-2">
          <ProductRatingStars rating={ratingSummary.averageRating} />
          <span className="font-sans text-[13px] text-[#657186]">
            {ratingSummary.averageRating.toFixed(1)} ({ratingSummary.reviewCount})
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-end gap-3 flex-wrap">
          <span className="font-playfair font-medium text-[36px] text-[#131720] leading-none">
            {formatPriceWithCurrency(totalPrice, product.currency)}
          </span>
          <span className="font-sans text-[18px] text-[#8c95a4] leading-none line-through pb-1">
            {formatPriceWithCurrency(comparePrice, product.currency)}
          </span>
          <span className="inline-flex items-center rounded-full bg-[#131720] px-2.5 py-1 text-[12px] font-semibold text-white leading-none mb-1">
            {upliftPercent}% off
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="font-sans text-[#657186] text-[13px]">
              Sale price · free shipping
            </p>
            <span className="inline-flex items-center gap-1.5 font-sans text-[13px] text-[#657186]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Delivered in 7–11 business days
            </span>
          </div>
          <SaleCountdown variant="pdp" />
        </div>

        {/* Sale offer block */}
        <div className="rounded-xl border border-[#131720] overflow-hidden">
          {/* Savings row */}
          <div className="flex items-center justify-between gap-4 bg-[#131720] px-4 py-3">
            <div className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span className="font-sans text-[13px] text-white/80">
                You save <span className="font-semibold text-white">{formatPriceWithCurrency(savings, product.currency)}</span> on this order
              </span>
            </div>
            <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-0.5 font-sans text-[11px] font-bold text-white tracking-wide">
              {upliftPercent}% OFF
            </span>
          </div>

          {/* Promo code row */}
          <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-[#131720] px-4 py-3">
            <span className="font-sans text-[13px] text-white/80">
              Extra 15% off with code
            </span>
            <button
              type="button"
              onClick={handlePromoCopy}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[13px] font-semibold tracking-widest transition-all ${promoCopied ? "border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]" : "border-white/20 bg-white/8 text-white hover:border-white/40"}`}
              aria-label={promoCopied ? "Copied" : `Copy code ${PROMO_CODE}`}
            >
              {PROMO_CODE}
              {promoCopied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Measure */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex items-center justify-between">
          <span className="font-sans font-semibold text-[14px] text-[#131720]">
            Measure your window
          </span>
          <div className="flex border border-[#dbe0e6] rounded-lg p-0.5 bg-white">
            <button
              onClick={() => updateMeasurementUnit("cm")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${unit === "cm" ? "bg-[#131720] text-white" : "text-[#657186]"}`}
            >
              cm
            </button>
            <button
              onClick={() => updateMeasurementUnit("in")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${unit === "in" ? "bg-[#131720] text-white" : "text-[#657186]"}`}
            >
              in
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#657186]">Width ({unit})</label>
            <input
              type="number"
              min={widthLimits.min}
              max={widthLimits.max}
              value={config.width || ""}
              onChange={(e) => {
                setConfig((prev) => ({ ...prev, width: Number(e.target.value) || 0 }));
              }}
              placeholder={widthLimits.placeholder}
              className="border border-[#dbe0e6] bg-[#f9fafb] rounded-xl px-3 py-2.5 text-sm text-[#131720] outline-none focus:border-[#131720]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#657186]">Height ({unit})</label>
            <input
              type="number"
              min={heightLimits.min}
              max={heightLimits.max}
              value={config.height || ""}
              onChange={(e) => {
                setConfig((prev) => ({ ...prev, height: Number(e.target.value) || 0 }));
              }}
              placeholder={heightLimits.placeholder}
              className="border border-[#dbe0e6] bg-[#f9fafb] rounded-xl px-3 py-2.5 text-sm text-[#131720] outline-none focus:border-[#131720]"
            />
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex flex-col gap-2">
          <span className="font-sans text-[14px]">
            <span className="font-semibold text-[#131720]">Blind Color — </span>
            <span className="text-[#657186]">{selectedBlindColor?.name}</span>
          </span>
          <div className="flex gap-3">
            {BLIND_COLOR_OPTIONS.map((color) => (
              <button
                key={color.id}
                onClick={() => setConfig((prev) => ({ ...prev, blindColor: color.id }))}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${config.blindColor === color.id ? 'ring-2 ring-offset-2 ring-[#131720]' : 'ring-1 ring-[#dbe0e6] hover:ring-[#131720]/50'}`}
                style={{ backgroundColor: color.hex }}
                aria-label={`Select ${color.name}`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <span className="font-sans text-[14px]">
            <span className="font-semibold text-[#131720]">Frame Color — </span>
            <span className="text-[#657186]">{selectedFrameColor?.name}</span>
          </span>
          <div className="flex gap-3">
            {FRAME_COLOR_OPTIONS.map((color) => (
              <button
                key={color.id}
                onClick={() => setConfig((prev) => ({ ...prev, frameColor: color.id }))}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${config.frameColor === color.id ? 'ring-2 ring-offset-2 ring-[#131720]' : 'ring-1 ring-[#dbe0e6] hover:ring-[#131720]/50'}`}
                style={{ backgroundColor: color.hex }}
                aria-label={`Select ${color.name}`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <span className="font-sans text-[14px]">
            <span className="font-semibold text-[#131720]">Opening Direction — </span>
            {selectedOpeningDirection ? (
              <span className="text-[#657186]">{selectedOpeningDirection.name}</span>
            ) : null}
          </span>
          <div className="flex flex-wrap gap-2">
            {OPENING_DIRECTION_OPTIONS.map((direction) => (
              <button
                key={direction.id}
                onClick={() => setConfig((prev) => ({ ...prev, openingDirection: direction.id }))}
                className={`px-4 py-2 rounded-full border text-sm transition-colors ${config.openingDirection === direction.id ? "border-[#131720] bg-[#131720] text-white" : "border-[#dbe0e6] text-[#657186] hover:border-[#131720]"}`}
              >
                {direction.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add To Cart */}
      <div className="flex flex-col gap-3 mt-6">
        <button
          ref={addToCartRef}
          type="button"
          onClick={handleAddToCart}
          disabled={isAddToCartDisabled}
          className="bg-[#131720] hover:bg-black disabled:bg-[#9aa3af] disabled:cursor-not-allowed transition-colors w-full rounded-full py-4 text-white font-medium flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {isAddingToCart ? "Adding..." : "Add to Cart"}
        </button>
        <div className="rounded-2xl border border-[#dbe0e6] bg-[#f9fafb] px-4 py-3 w-fit self-center mt-2">
          <Image
            src="/payment-badge.png"
            alt="Accepted payment methods: PayPal, Visa, MasterCard, and American Express"
            width={400}
            height={60}
            sizes="(max-width: 768px) 100vw, 450px"
            className="h-auto w-auto"
          />
        </div>
      </div>

      {/* Perfect-Fit Promise */}
      <div className="py-6 border-t border-[#dbe0e6]">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#657186] mb-4">
          The Perfect-Fit Promise
        </p>
        <div className="grid grid-cols-3 gap-3">
          {/* Free USA Shipping */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="bg-[#eaedf0] rounded-full w-10 h-10 flex items-center justify-center mb-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <span className="font-semibold text-xs text-[#131720]">Free USA Shipping</span>
            <span className="text-xs text-[#657186]">On every order, always</span>
          </div>

          {/* 1-Year Warranty */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="bg-[#eaedf0] rounded-full w-10 h-10 flex items-center justify-center mb-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <span className="font-semibold text-xs text-[#131720]">1-Year Warranty</span>
            <span className="text-xs text-[#657186]">Manufacturer backed</span>
          </div>

          {/* 4.8 / 5 Stars */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="bg-[#eaedf0] rounded-full w-10 h-10 flex items-center justify-center mb-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-[#131720]">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <span className="font-semibold text-xs text-[#131720]">4.8 / 5 Stars</span>
            <span className="text-xs text-[#657186]">Rated Excellent — 750+ reviews</span>
          </div>
        </div>
      </div>

      <div id="product-details" className="border-t border-[#dbe0e6]">
        <ProductAccordion items={product.accordionItems} />
      </div>

      {/* Sticky Add to Cart bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 border-t border-[#dbe0e6] bg-white/95 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-transform duration-300 ${showStickyBar ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!showStickyBar}
      >
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[22px] font-semibold text-[#131720]">
                {formatPriceWithCurrency(totalPrice, product.currency)}
              </span>
              <span className="font-sans text-[16px] text-[#8c95a4] line-through">
                {formatPriceWithCurrency(comparePrice, product.currency)}
              </span>
              <span className="rounded-full bg-[#131720] px-2 py-0.5 font-sans text-[12px] font-semibold text-white">
                {upliftPercent}% off
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAddToCartDisabled}
            className="shrink-0 rounded-full bg-[#131720] px-6 py-3 font-sans text-[14px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-[#9aa3af]"
          >
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
