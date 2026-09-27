"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import SaleCountdown from "@/components/common/SaleCountdown";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/hooks/useCheckout";
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
  CartItem,
  CustomizationPricing,
  PriceBandMatrix,
  Product,
  ProductConfiguration,
  ProductReviewsData,
} from "@/types";
import { readStorage, writeStorage } from "@/lib/browser-storage";
import { DEFAULT_CONFIGURATION } from "@/types";
import ProductAccordion from "@/components/product/ProductAccordion";
import LuminaFitPromiseModal from "@/components/product/LuminaFitPromiseModal";
import OpeningDirectionGuideModal from "@/components/product/OpeningDirectionGuideModal";
import GuaranteeBadges from "@/components/product/GuaranteeBadges";

const PROMO_CODE = "FINAL15";
const INCH_FRACTIONS = [
  "0",
  "1/16",
  "1/8",
  "3/16",
  "1/4",
  "5/16",
  "3/8",
  "7/16",
  "1/2",
  "9/16",
  "5/8",
  "11/16",
  "3/4",
  "13/16",
  "7/8",
  "15/16",
];
const MILLIMETRES = Array.from({ length: 10 }, (_, value) => String(value));

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

type CustomizationField = "size" | "blindColor" | "frameColor" | "openingDirection";

const FIELD_ORDER: CustomizationField[] = ["size", "blindColor", "frameColor", "openingDirection"];

export default function ProductInfo({ product, initialReviewsData }: ProductInfoProps) {
  const { addToCart, isCartReady } = useCart();
  const { checkout, isCheckingOut: isBuyingNow, checkoutError: buyNowError } = useCheckout();
  const actionBusy = useRef(false);
  const [isPreparingBuyNow, setIsPreparingBuyNow] = useState(false);
  const addToCartRef = useRef<HTMLButtonElement>(null);
  const sizeSectionRef = useRef<HTMLDivElement>(null);
  const blindColorSectionRef = useRef<HTMLDivElement>(null);
  const frameColorSectionRef = useRef<HTMLDivElement>(null);
  const openingDirectionSectionRef = useRef<HTMLDivElement>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<CustomizationField, string>>>({});
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [pricingLoaded, setPricingLoaded] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pricingAttempt, setPricingAttempt] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFitPromiseOpen, setIsFitPromiseOpen] = useState(false);
  const [isOpeningDirectionGuideOpen, setIsOpeningDirectionGuideOpen] = useState(false);
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
    try {
      const saved = JSON.parse(readStorage(`product-draft:${product.slug}`) || 'null');
      if (saved && Number.isFinite(saved.savedAt) && saved.savedAt <= Date.now() && Date.now() - saved.savedAt < 7 * 24 * 60 * 60 * 1000 && saved.config &&
          Number.isFinite(saved.config.width) && Number.isFinite(saved.config.height) &&
          ['inches', 'cm'].includes(saved.config.widthUnit) && ['inches', 'cm'].includes(saved.config.heightUnit) &&
          Object.entries(saved.config).every(([key, value]) => key in DEFAULT_CONFIGURATION && (value === null || typeof value === 'string' || typeof value === 'number'))) {
        setConfig(previous => ({ ...previous, ...saved.config }));
      }
    } catch { /* ignore corrupt/expired drafts */ }
    setDraftReady(true);
  }, [product.slug]);

  useEffect(() => {
    if (!draftReady) return;
    const timer = setTimeout(() => writeStorage(`product-draft:${product.slug}`, JSON.stringify({ config, savedAt: Date.now() })), 250);
    return () => clearTimeout(timer);
  }, [config, draftReady, product.slug]);

  useEffect(() => {
    let isMounted = true;
    setPricingLoaded(false);
    setPricingError(null);

    const loadPricing = async () => {
      try {
        const [matrix, customizations] = await Promise.all([
          fetchPriceMatrix(product.slug),
          fetchCustomizationPricing(),
        ]);

        if (!isMounted) return;

        setPriceMatrix(matrix);
        setCustomizationPricing(customizations);
        setPricingLoaded(true);
      } catch (error) {
        console.error("Failed to load pricing data:", error);
        if (isMounted) setPricingError("Pricing could not be loaded. Please retry before ordering.");
      }
    };

    loadPricing();

    return () => {
      isMounted = false;
    };
  }, [product.slug, pricingAttempt]);

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

  const clearFieldError = (field: CustomizationField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

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

  const sectionRefs: Record<CustomizationField, React.RefObject<HTMLDivElement | null>> = {
    size: sizeSectionRef,
    blindColor: blindColorSectionRef,
    frameColor: frameColorSectionRef,
    openingDirection: openingDirectionSectionRef,
  };

  const validateConfiguration = () => {
    const errors: Partial<Record<CustomizationField, string>> = {};

    if (product.features.hasSize) {
      const widthInches = getTotalInches(config.width, config.widthFraction, config.widthUnit);
      const heightInches = getTotalInches(config.height, config.heightFraction, config.heightUnit);
      const minWidthInches = sizeRanges?.minWidth ?? 20;
      const maxWidthInches = sizeRanges?.maxWidth ?? 157;
      const minHeightInches = sizeRanges?.minHeight ?? 20;
      const maxHeightInches = sizeRanges?.maxHeight ?? 118;

      if (widthInches <= 0 || heightInches <= 0) {
        errors.size = "Please enter your window width and height.";
      } else if (
        widthInches < minWidthInches ||
        widthInches > maxWidthInches ||
        heightInches < minHeightInches ||
        heightInches > maxHeightInches
      ) {
        errors.size = `Width must be ${widthLimits.min}-${widthLimits.max} ${unit} and height ${heightLimits.min}-${heightLimits.max} ${unit}.`;
      }
    }

    if (product.features.hasBlindColor && !config.blindColor) {
      errors.blindColor = "Please select a blind color.";
    }

    if (product.features.hasFrameColor && !config.frameColor) {
      errors.frameColor = "Please select a frame color.";
    }

    if (product.features.hasOpeningDirection && !config.openingDirection) {
      errors.openingDirection = "Please select an opening direction.";
    }

    return errors;
  };

  const isActionInProgress = isAddingToCart || isPreparingBuyNow || isBuyingNow;
  const isAddToCartDisabled = isActionInProgress || !pricingLoaded || !isCartReady;
  const isBuyNowDisabled = isActionInProgress || !pricingLoaded || !isCartReady;

  const handleAddToCart = async () => {
    if (isAddToCartDisabled || actionBusy.current) return;

    const errors = validateConfiguration();
    setFieldErrors(errors);

    const firstInvalidField = FIELD_ORDER.find((field) => errors[field]);
    if (firstInvalidField) {
      const section = sectionRefs[firstInvalidField].current;
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "center" });
        section.querySelector<HTMLElement>("input, button")?.focus({ preventScroll: true });
      }
      return;
    }

    actionBusy.current = true;
    setActionError(null);
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
      setActionError(error instanceof Error ? error.message : "We could not verify your price. Please try again.");
    } finally {
      actionBusy.current = false;
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isBuyNowDisabled || actionBusy.current) return;

    const errors = validateConfiguration();
    setFieldErrors(errors);

    const firstInvalidField = FIELD_ORDER.find((field) => errors[field]);
    if (firstInvalidField) {
      const section = sectionRefs[firstInvalidField].current;
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "center" });
        section.querySelector<HTMLElement>("input, button")?.focus({ preventScroll: true });
      }
      return;
    }

    actionBusy.current = true;
    setActionError(null);
    setIsPreparingBuyNow(true);

    let finalPrice = totalPrice;
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

      finalPrice = validation.valid ? totalPrice : validation.calculatedPrice;
    } catch (error) {
      console.error("Price validation failed:", error);
      setActionError(error instanceof Error ? error.message : "We could not verify your price. Please try again.");
      return;
    } finally {
      actionBusy.current = false;
      setIsPreparingBuyNow(false);
    }

    const adHocItem: CartItem = {
      id: `${product.id}-buy-now`,
      product: { ...product, price: finalPrice },
      configuration: config,
      quantity: 1,
      addedAt: new Date(),
    };

    await checkout([adHocItem]);
  };

  const deliveryRange = useMemo(() => {
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const now = new Date();
    const early = new Date(now);
    early.setDate(now.getDate() + 7);
    const late = new Date(now);
    late.setDate(now.getDate() + 11);
    return `Delivered by ${fmt(early)} – ${fmt(late)}`;
  }, []);

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
              {deliveryRange}
            </span>
          </div>
          <SaleCountdown variant="pdp" />
        </div>

        <GuaranteeBadges />

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

      {pricingError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p>{pricingError}</p>
          <button type="button" onClick={() => setPricingAttempt(attempt => attempt + 1)} className="mt-2 font-semibold underline">Retry pricing</button>
        </div>
      )}
      {actionError && <p role="alert" className="text-sm text-red-700">{actionError}</p>}

      {/* Size */}
      <div
        ref={sizeSectionRef}
        className={`flex flex-col gap-4 mt-6 scroll-mt-28 ${fieldErrors.size ? "rounded-xl border border-[#dc2626] bg-[#fef2f2] p-4" : ""}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-sans font-semibold text-[14px] text-[#131720]">
            Measure your window
          </span>
          <div className="flex rounded-lg border border-[#dbe0e6] bg-white p-0.5" role="group" aria-label="Measurement unit">
            <button
              type="button"
              onClick={() => updateMeasurementUnit("in")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${unit === "in" ? "bg-[#131720] text-white" : "text-[#657186] hover:text-[#131720]"}`}
            >
              Inches
            </button>
            <button
              type="button"
              onClick={() => updateMeasurementUnit("cm")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${unit === "cm" ? "bg-[#131720] text-white" : "text-[#657186] hover:text-[#131720]"}`}
            >
              Centimeters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {([
            { name: "Width", value: config.width, fraction: config.widthFraction, limits: widthLimits, onValueChange: (width: number) => setConfig((prev) => ({ ...prev, width })), onFractionChange: (widthFraction: string) => setConfig((prev) => ({ ...prev, widthFraction })) },
            { name: "Height", value: config.height, fraction: config.heightFraction, limits: heightLimits, onValueChange: (height: number) => setConfig((prev) => ({ ...prev, height })), onFractionChange: (heightFraction: string) => setConfig((prev) => ({ ...prev, heightFraction })) },
          ] as const).map((dimension) => (
            <div key={dimension.name} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[112px_minmax(0,1fr)_minmax(0,1fr)] sm:gap-3">
              <label className="font-sans text-sm text-[#657186]" htmlFor={`product-${dimension.name.toLowerCase()}`}>
                {dimension.name}
              </label>
              <div className={`rounded-xl border bg-[#f9fafb] px-3 py-2.5 transition-colors focus-within:border-[#131720] ${fieldErrors.size ? "border-[#dc2626]" : "border-[#dbe0e6]"}`}>
                <span className="block text-xs text-[#657186]">
                  {unit === "in" ? "Inches" : "Centimeters"}
                </span>
                <input
                  id={`product-${dimension.name.toLowerCase()}`}
                  type="number"
                  min={dimension.limits.min}
                  max={dimension.limits.max}
                  value={dimension.value || ""}
                  onChange={(event) => {
                    dimension.onValueChange(Number(event.target.value) || 0);
                    clearFieldError("size");
                  }}
                  placeholder={dimension.limits.placeholder}
                  aria-invalid={Boolean(fieldErrors.size)}
                  className="mt-0.5 w-full appearance-none bg-transparent text-sm text-[#131720] outline-none placeholder:text-[#8c95a4]"
                />
              </div>
              <div className={`rounded-xl border bg-[#f9fafb] px-3 py-2.5 transition-colors focus-within:border-[#131720] ${fieldErrors.size ? "border-[#dc2626]" : "border-[#dbe0e6]"}`}>
                <label className="block text-xs text-[#657186]" htmlFor={`product-${dimension.name.toLowerCase()}-precision`}>
                  {unit === "in" ? "Sixteenths" : "Millimeters"}
                </label>
                <select
                  id={`product-${dimension.name.toLowerCase()}-precision`}
                  value={dimension.fraction}
                  onChange={(event) => {
                    dimension.onFractionChange(event.target.value);
                    clearFieldError("size");
                  }}
                  aria-label={`${dimension.name} ${unit === "in" ? "sixteenths" : "millimeters"}`}
                  className="mt-0.5 w-full appearance-none bg-transparent text-sm text-[#131720] outline-none"
                >
                  {(unit === "in" ? INCH_FRACTIONS : MILLIMETRES).map((value) => (
                    <option key={value} value={value}>{unit === "in" ? value : `${value} mm`}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {fieldErrors.size ? (
          <p role="alert" className="font-sans text-[13px] font-medium text-[#dc2626]">
            {fieldErrors.size}
          </p>
        ) : null}
      </div>

      {/* Colors */}
      <div className="flex flex-col gap-4 mt-6">
        <div
          ref={blindColorSectionRef}
          className={`flex flex-col gap-2 scroll-mt-28 ${fieldErrors.blindColor ? "rounded-xl border border-[#dc2626] bg-[#fef2f2] p-4" : ""}`}
        >
          <span className="font-sans text-[14px]">
            <span className="font-semibold text-[#131720]">Blind Color — </span>
            <span className="text-[#657186]">{selectedBlindColor?.name}</span>
          </span>
          <div className="flex gap-3">
            {BLIND_COLOR_OPTIONS.map((color) => (
              <button
                key={color.id}
                onClick={() => {
                  setConfig((prev) => ({ ...prev, blindColor: color.id }));
                  clearFieldError("blindColor");
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${config.blindColor === color.id ? 'ring-2 ring-offset-2 ring-[#131720]' : fieldErrors.blindColor ? 'ring-1 ring-[#dc2626] hover:ring-[#131720]/50' : 'ring-1 ring-[#dbe0e6] hover:ring-[#131720]/50'}`}
                style={{ backgroundColor: color.hex }}
                aria-label={`Select ${color.name}`}
              />
            ))}
          </div>
          {fieldErrors.blindColor ? (
            <p role="alert" className="font-sans text-[13px] font-medium text-[#dc2626]">
              {fieldErrors.blindColor}
            </p>
          ) : null}
        </div>

        <div
          ref={frameColorSectionRef}
          className={`flex flex-col gap-2 mt-2 scroll-mt-28 ${fieldErrors.frameColor ? "rounded-xl border border-[#dc2626] bg-[#fef2f2] p-4" : ""}`}
        >
          <span className="font-sans text-[14px]">
            <span className="font-semibold text-[#131720]">Frame Color — </span>
            <span className="text-[#657186]">{selectedFrameColor?.name}</span>
          </span>
          <div className="flex gap-3">
            {FRAME_COLOR_OPTIONS.map((color) => (
              <button
                key={color.id}
                onClick={() => {
                  setConfig((prev) => ({ ...prev, frameColor: color.id }));
                  clearFieldError("frameColor");
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${config.frameColor === color.id ? 'ring-2 ring-offset-2 ring-[#131720]' : fieldErrors.frameColor ? 'ring-1 ring-[#dc2626] hover:ring-[#131720]/50' : 'ring-1 ring-[#dbe0e6] hover:ring-[#131720]/50'}`}
                style={{ backgroundColor: color.hex }}
                aria-label={`Select ${color.name}`}
              />
            ))}
          </div>
          {fieldErrors.frameColor ? (
            <p role="alert" className="font-sans text-[13px] font-medium text-[#dc2626]">
              {fieldErrors.frameColor}
            </p>
          ) : null}
        </div>

        <div
          ref={openingDirectionSectionRef}
          className={`flex flex-col gap-2 mt-2 scroll-mt-28 ${fieldErrors.openingDirection ? "rounded-xl border border-[#dc2626] bg-[#fef2f2] p-4" : ""}`}
        >
          <span className="font-sans text-[14px] flex items-center gap-1.5">
            <span className="font-semibold text-[#131720]">Opening Direction — </span>
            {selectedOpeningDirection ? (
              <span className="text-[#657186]">{selectedOpeningDirection.name}</span>
            ) : null}
            <button
              type="button"
              onClick={() => setIsOpeningDirectionGuideOpen(true)}
              className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#eaedf0] text-[#4051b5] transition-colors hover:bg-[#4051b5] hover:text-white"
              aria-label="Learn more about opening direction options"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          </span>
          <div className="flex flex-wrap gap-2">
            {OPENING_DIRECTION_OPTIONS.map((direction) => (
              <button
                key={direction.id}
                onClick={() => {
                  setConfig((prev) => ({ ...prev, openingDirection: direction.id }));
                  clearFieldError("openingDirection");
                }}
                className={`px-4 py-2 rounded-full border text-sm transition-colors ${config.openingDirection === direction.id ? "border-[#131720] bg-[#131720] text-white" : fieldErrors.openingDirection ? "border-[#dc2626] text-[#657186] hover:border-[#131720]" : "border-[#dbe0e6] text-[#657186] hover:border-[#131720]"}`}
              >
                {direction.name}
                {direction.price ? ` (+ ${formatPriceWithCurrency(direction.price, product.currency)})` : ""}
              </button>
            ))}
          </div>
          {fieldErrors.openingDirection ? (
            <p role="alert" className="font-sans text-[13px] font-medium text-[#dc2626]">
              {fieldErrors.openingDirection}
            </p>
          ) : null}
        </div>
      </div>

      <OpeningDirectionGuideModal
        open={isOpeningDirectionGuideOpen}
        onClose={() => setIsOpeningDirectionGuideOpen(false)}
      />

      {/* Add To Cart */}
      <div className="flex flex-col gap-3 mt-6">
        <button
          type="button"
          onClick={() => setIsFitPromiseOpen(true)}
          className="flex items-center justify-between gap-2 rounded-full border border-[#dbe0e6] bg-[#f9fafb] px-4 py-2.5 text-left transition-colors hover:border-[#131720]"
        >
          <span className="flex items-center gap-2 font-sans text-[13px] font-semibold text-[#131720]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4051b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <polyline points="8 12.5 10.5 15 16 9" />
            </svg>
            The Lumina Fit Promise
          </span>
          <span className="font-sans text-[12px] font-medium text-[#4051b5]">Learn More</span>
        </button>
        {buyNowError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {buyNowError}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button
            ref={addToCartRef}
            type="button"
            onClick={handleAddToCart}
            disabled={isAddToCartDisabled}
            className="bg-white hover:bg-[#f9fafb] disabled:bg-[#f3f4f6] disabled:text-[#9aa3af] disabled:cursor-not-allowed transition-colors w-full rounded-full py-4 text-[#131720] font-medium border border-[#131720] flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isBuyNowDisabled}
            className="bg-[#131720] hover:bg-black disabled:bg-[#9aa3af] disabled:cursor-not-allowed transition-colors w-full rounded-full py-4 text-white font-medium flex items-center justify-center gap-2"
          >
            {isPreparingBuyNow || isBuyingNow ? "Processing..." : "Buy Now"}
          </button>
        </div>
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
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
              className="hidden sm:inline-flex shrink-0 rounded-full border border-[#131720] bg-white px-5 py-3 font-sans text-[14px] font-medium text-[#131720] transition-colors hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:text-[#9aa3af] disabled:border-[#dbe0e6]"
            >
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isBuyNowDisabled}
              className="shrink-0 rounded-full bg-[#131720] px-6 py-3 font-sans text-[14px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-[#9aa3af]"
            >
              {isPreparingBuyNow || isBuyingNow ? "Processing..." : "Buy Now"}
            </button>
          </div>
        </div>
      </div>

      <LuminaFitPromiseModal open={isFitPromiseOpen} onClose={() => setIsFitPromiseOpen(false)} />
    </div>
  );
}
