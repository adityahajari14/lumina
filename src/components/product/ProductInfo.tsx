"use client";

import { useEffect, useMemo, useState } from "react";
import ProductAccordion from "./ProductAccordion";
import { useCart } from "@/context/CartContext";
import { calculateTotalPrice, configToCustomizations, getTotalInches } from "@/lib/pricing";
import { fetchCustomizationPricing, fetchPriceMatrix, formatPriceWithCurrency, validateCartPrice } from "@/lib/api";
import {
  BLIND_COLOR_OPTIONS,
  FRAME_COLOR_OPTIONS,
  OPENING_DIRECTION_OPTIONS,
} from "@/data/customizations";
import type { CustomizationPricing, PriceBandMatrix, Product, ProductConfiguration } from "@/types";
import { DEFAULT_CONFIGURATION } from "@/types";

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { addToCart } = useCart();
  const [pricingLoaded, setPricingLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [priceMatrix, setPriceMatrix] = useState<PriceBandMatrix | null>(null);
  const [customizationPricing, setCustomizationPricing] = useState<CustomizationPricing[]>([]);
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

  const handleAddToCart = async () => {
    if (config.width <= 0 || config.height <= 0) return;

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

  const selectedBlindColor = BLIND_COLOR_OPTIONS.find((color) => color.id === config.blindColor);
  const selectedFrameColor = FRAME_COLOR_OPTIONS.find((color) => color.id === config.frameColor);
  const selectedOpeningDirection = OPENING_DIRECTION_OPTIONS.find(
    (direction) => direction.id === config.openingDirection
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-[600px] pb-16">
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <h1 className="font-playfair font-medium text-[#131720] text-4xl lg:text-[48px] leading-tight">
          {product.name}
        </h1>
        <div className="flex items-center text-sm gap-2">
          <div className="flex gap-0.5 text-[#131720]">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="bg-[#eaedf0] rounded-xl flex items-center gap-3 py-4 px-4 w-full">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
          <rect x="3" y="8" width="18" height="10" rx="2"></rect>
          <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"></path>
          <circle cx="8" cy="18" r="2"></circle>
          <circle cx="16" cy="18" r="2"></circle>
        </svg>
        <div className="flex flex-col text-sm">
          <span className="font-sans text-[#657186]">Estimated Delivery</span>
          <span className="font-sans font-semibold text-[#131720]">
            {product.estimatedDelivery || "12 Working Days"}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-end gap-2 pt-2">
        <span className="font-playfair font-medium text-[36px] text-[#131720] leading-none">
          {formatPriceWithCurrency(totalPrice, product.currency)}
        </span>
        <span className="font-sans text-[#657186] text-[14px]">
          incl. VAT · free shipping
        </span>
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
            <span className="font-semibold text-[#131720]">Blind Colour — </span>
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
            <span className="font-semibold text-[#131720]">Frame Colour — </span>
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
          onClick={handleAddToCart}
          disabled={
            isAddingToCart ||
            !pricingLoaded ||
            config.width <= 0 ||
            config.height <= 0 ||
            !config.blindColor ||
            !config.frameColor ||
            !config.openingDirection
          }
          className="bg-[#131720] hover:bg-black disabled:bg-[#9aa3af] transition-colors w-full rounded-full py-4 text-white font-medium flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {isAddingToCart ? "Adding..." : "Add to Cart"}
        </button>
        <span className="text-center text-xs text-[#657186]">
          Free returns within 60 days · 5-year warranty
        </span>
      </div>

      {/* Guarantee Grid */}
      <div className="grid grid-cols-3 gap-2 py-6 border-t border-[#dbe0e6] mt-4">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="bg-[#eaedf0] rounded-full w-10 h-10 flex items-center justify-center mb-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <span className="font-semibold text-xs text-[#131720]">5-Year Warranty</span>
          <span className="text-xs text-[#657186]">Manufacturer backed guarantee</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <div className="bg-[#eaedf0] rounded-full w-10 h-10 flex items-center justify-center mb-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
              <path d="M12.5 10L5.52253 16.9775C5.19101 17.309 4.74137 17.4953 4.27253 17.4953C3.80369 17.4953 3.35405 17.309 3.02253 16.9775C2.69101 16.646 2.50476 16.1963 2.50476 15.7275C2.50476 15.2587 2.69101 14.809 3.02253 14.4775L10 7.5" />
              <path d="M15 12.5L18.3333 9.16663" />
              <path d="M17.9167 9.58334L16.3217 7.98834C16.0091 7.67585 15.8334 7.252 15.8333 6.81001V5.83334L13.95 3.95001C13.0204 3.021 11.7625 2.49531 10.4483 2.48667L7.5 2.46667L8.26667 3.15001C8.81121 3.63283 9.24724 4.22559 9.54602 4.88921C9.84479 5.55283 9.99952 6.27224 10 7.00001V8.33334L11.6667 10H12.6433C13.0853 10.0001 13.5092 10.1758 13.8217 10.4883L15.4167 12.0833" />
            </svg>
          </div>
          <span className="font-semibold text-xs text-[#131720]">Easy Install</span>
          <span className="text-xs text-[#657186]">No tools needed, all fittings included</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <div className="bg-[#eaedf0] rounded-full w-10 h-10 flex items-center justify-center mb-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <span className="font-semibold text-xs text-[#131720]">4.9 / 5 Stars</span>
          <span className="text-xs text-[#657186]">Rated Excellent — 2,400+ reviews</span>
        </div>
      </div>

      <div id="product-details" className="border-t border-[#dbe0e6]">
        <ProductAccordion items={product.accordionItems} />
      </div>
    </div>
  );
}
