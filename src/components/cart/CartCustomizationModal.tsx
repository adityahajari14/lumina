"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchCustomizationPricing,
  fetchPriceMatrix,
  formatPriceWithCurrency,
  validateCartPrice,
} from "@/lib/api";
import { calculateTotalPrice, configToCustomizations, getTotalInches } from "@/lib/pricing";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import {
  BLIND_COLOR_OPTIONS,
  FRAME_COLOR_OPTIONS,
  OPENING_DIRECTION_OPTIONS,
} from "@/data/customizations";
import type {
  CartItem,
  CustomizationPricing,
  PriceBandMatrix,
  ProductConfiguration,
} from "@/types";

interface CartCustomizationModalProps {
  item: CartItem | null;
  onClose: () => void;
  onSave: (itemId: string, configuration: ProductConfiguration, productPrice: number) => void;
}

export default function CartCustomizationModal({ item, onClose, onSave }: CartCustomizationModalProps) {
  const [draftConfig, setDraftConfig] = useState<ProductConfiguration | null>(null);
  const [pricingLoaded, setPricingLoaded] = useState(false);
  const [pricingAttempt, setPricingAttempt] = useState(0);
  const [priceMatrix, setPriceMatrix] = useState<PriceBandMatrix | null>(null);
  const [customizationPricing, setCustomizationPricing] = useState<CustomizationPricing[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;
    setDraftConfig(item.configuration);
    setSaveError(null);
    setIsSaving(false);
  }, [item]);

  useEffect(() => {
    if (!item) return;

    let isMounted = true;
    setPricingLoaded(false);
    setPriceMatrix(null);

    const loadPricing = async () => {
      try {
        const [matrix, customizations] = await Promise.all([
          fetchPriceMatrix(item.product.slug),
          fetchCustomizationPricing(),
        ]);

        if (!isMounted) return;
        setSaveError(null);
        setPriceMatrix(matrix);
        setCustomizationPricing(customizations);
      } catch (error) {
        console.error("Failed to load cart item pricing:", error);
        if (isMounted) {
          setSaveError("Pricing could not be loaded. Please try again.");
        }
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
  }, [item, pricingAttempt]);

  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(Boolean(item && draftConfig), dialogRef, onClose);

  const unit = draftConfig?.widthUnit === "cm" ? "cm" : "in";

  const selectedCustomizations = useMemo(
    () =>
      configToCustomizations({
        blindColor: draftConfig?.blindColor,
        frameColor: draftConfig?.frameColor,
        openingDirection: draftConfig?.openingDirection,
      }),
    [draftConfig?.blindColor, draftConfig?.frameColor, draftConfig?.openingDirection]
  );

  const sizeRanges = useMemo(() => {
    if (!priceMatrix || priceMatrix.widthBands.length === 0 || priceMatrix.heightBands.length === 0) {
      return null;
    }

    return {
      minWidth: Math.min(...priceMatrix.widthBands.map((band) => band.inches)),
      maxWidth: Math.max(...priceMatrix.widthBands.map((band) => band.inches)),
      minHeight: Math.min(...priceMatrix.heightBands.map((band) => band.inches)),
      maxHeight: Math.max(...priceMatrix.heightBands.map((band) => band.inches)),
    };
  }, [priceMatrix]);

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

  const totalPrice = useMemo(() => {
    if (!item || !draftConfig) return 0;

    const widthInches = getTotalInches(
      draftConfig.width,
      draftConfig.widthFraction,
      draftConfig.widthUnit
    );
    const heightInches = getTotalInches(
      draftConfig.height,
      draftConfig.heightFraction,
      draftConfig.heightUnit
    );

    if (!priceMatrix || widthInches <= 0 || heightInches <= 0) {
      return item.product.price;
    }

    return (
      calculateTotalPrice(
        widthInches,
        heightInches,
        priceMatrix,
        selectedCustomizations,
        customizationPricing
      )?.totalPrice ?? item.product.price
    );
  }, [customizationPricing, draftConfig, item, priceMatrix, selectedCustomizations]);

  if (!item || !draftConfig) return null;

  const selectedBlindColor = BLIND_COLOR_OPTIONS.find((color) => color.id === draftConfig.blindColor);
  const selectedFrameColor = FRAME_COLOR_OPTIONS.find((color) => color.id === draftConfig.frameColor);
  const selectedOpeningDirection = OPENING_DIRECTION_OPTIONS.find(
    (direction) => direction.id === draftConfig.openingDirection
  );

  const hasValidSize =
    !item.product.features.hasSize ||
    (draftConfig.width >= widthLimits.min &&
      draftConfig.width <= widthLimits.max &&
      draftConfig.height >= heightLimits.min &&
      draftConfig.height <= heightLimits.max);

  const hasRequiredCustomizations =
    (!item.product.features.hasBlindColor || Boolean(draftConfig.blindColor)) &&
    (!item.product.features.hasFrameColor || Boolean(draftConfig.frameColor)) &&
    (!item.product.features.hasOpeningDirection || Boolean(draftConfig.openingDirection));

  const canSave = pricingLoaded && Boolean(priceMatrix) && hasValidSize && hasRequiredCustomizations && !isSaving;

  const updateDraftConfig = (updates: Partial<ProductConfiguration>) => {
    setDraftConfig((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const updateMeasurementUnit = (nextUnit: "cm" | "in") => {
    updateDraftConfig({
      widthUnit: nextUnit === "cm" ? "cm" : "inches",
      heightUnit: nextUnit === "cm" ? "cm" : "inches",
    });
  };

  const handleSave = async () => {
    if (!canSave) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const widthInches = getTotalInches(
        draftConfig.width,
        draftConfig.widthFraction,
        draftConfig.widthUnit
      );
      const heightInches = getTotalInches(
        draftConfig.height,
        draftConfig.heightFraction,
        draftConfig.heightUnit
      );

      const validation = await validateCartPrice(
        {
          handle: item.product.slug,
          widthInches,
          heightInches,
          customizations: selectedCustomizations,
        },
        totalPrice
      );

      onSave(item.id, draftConfig, validation.valid ? totalPrice : validation.calculatedPrice);
      onClose();
    } catch (error) {
      console.error("Cart item price validation failed:", error);
      setSaveError(error instanceof Error ? error.message : "Could not save customisation.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-[#131720]/55"
        onClick={onClose}
        aria-label="Close customisation editor"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-customisation-title"
        className="relative w-full max-w-[680px] max-h-[90vh] overflow-y-auto rounded-[24px] bg-white shadow-2xl border border-[#eaedf0]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#eaedf0] bg-white px-5 py-5 md:px-7">
          <div>
            <h2 id="cart-customisation-title" className="font-playfair font-medium text-[#131720] text-[28px] leading-tight">
              Edit Customisation
            </h2>
            <p className="font-sans text-[14px] text-[#657186] mt-1">{item.product.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-[#dbe0e6] text-[#657186] hover:text-[#131720] hover:border-[#131720] transition-colors flex items-center justify-center shrink-0"
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="px-5 py-6 md:px-7 flex flex-col gap-7">
          {pricingLoaded && !priceMatrix && <button type="button" className="text-sm underline" onClick={() => setPricingAttempt(attempt => attempt + 1)}>Retry pricing</button>}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-sans font-semibold text-[14px] text-[#131720]">
                Measure your window
              </span>
              <div className="flex border border-[#dbe0e6] rounded-lg p-0.5 bg-white">
                <button
                  type="button"
                  onClick={() => updateMeasurementUnit("cm")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${unit === "cm" ? "bg-[#131720] text-white" : "text-[#657186]"}`}
                >
                  cm
                </button>
                <button
                  type="button"
                  onClick={() => updateMeasurementUnit("in")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${unit === "in" ? "bg-[#131720] text-white" : "text-[#657186]"}`}
                >
                  in
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#657186]" htmlFor="cart-edit-width">Width ({unit})</label>
                <input
                  id="cart-edit-width"
                  type="number"
                  min={widthLimits.min}
                  max={widthLimits.max}
                  value={draftConfig.width || ""}
                  onChange={(event) => updateDraftConfig({ width: Number(event.target.value) || 0 })}
                  placeholder={widthLimits.placeholder}
                  className="border border-[#dbe0e6] bg-[#f9fafb] rounded-xl px-3 py-2.5 text-sm text-[#131720] outline-none focus:border-[#131720]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#657186]" htmlFor="cart-edit-height">Height ({unit})</label>
                <input
                  id="cart-edit-height"
                  type="number"
                  min={heightLimits.min}
                  max={heightLimits.max}
                  value={draftConfig.height || ""}
                  onChange={(event) => updateDraftConfig({ height: Number(event.target.value) || 0 })}
                  placeholder={heightLimits.placeholder}
                  className="border border-[#dbe0e6] bg-[#f9fafb] rounded-xl px-3 py-2.5 text-sm text-[#131720] outline-none focus:border-[#131720]"
                />
              </div>
            </div>
            {!hasValidSize && (
              <p className="text-[13px] text-red-600">
                Enter a size between {widthLimits.min}-{widthLimits.max}{unit} wide and {heightLimits.min}-{heightLimits.max}{unit} high.
              </p>
            )}
          </div>

          {item.product.features.hasBlindColor && (
            <div className="flex flex-col gap-2">
              <span className="font-sans text-[14px]">
                <span className="font-semibold text-[#131720]">Blind Colour: </span>
                <span className="text-[#657186]">{selectedBlindColor?.name || "Select a colour"}</span>
              </span>
              <div className="flex flex-wrap gap-3">
                {BLIND_COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => updateDraftConfig({ blindColor: color.id })}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${draftConfig.blindColor === color.id ? "ring-2 ring-offset-2 ring-[#131720]" : "ring-1 ring-[#dbe0e6] hover:ring-[#131720]/50"}`}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Select ${color.name}`}
                  />
                ))}
              </div>
            </div>
          )}

          {item.product.features.hasFrameColor && (
            <div className="flex flex-col gap-2">
              <span className="font-sans text-[14px]">
                <span className="font-semibold text-[#131720]">Frame Colour: </span>
                <span className="text-[#657186]">{selectedFrameColor?.name || "Select a colour"}</span>
              </span>
              <div className="flex flex-wrap gap-3">
                {FRAME_COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => updateDraftConfig({ frameColor: color.id })}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${draftConfig.frameColor === color.id ? "ring-2 ring-offset-2 ring-[#131720]" : "ring-1 ring-[#dbe0e6] hover:ring-[#131720]/50"}`}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Select ${color.name}`}
                  />
                ))}
              </div>
            </div>
          )}

          {item.product.features.hasOpeningDirection && (
            <div className="flex flex-col gap-2">
              <span className="font-sans text-[14px]">
                <span className="font-semibold text-[#131720]">Opening Direction: </span>
                <span className="text-[#657186]">{selectedOpeningDirection?.name || "Select direction"}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {OPENING_DIRECTION_OPTIONS.map((direction) => (
                  <button
                    key={direction.id}
                    type="button"
                    onClick={() => updateDraftConfig({ openingDirection: direction.id })}
                    className={`px-4 py-2 rounded-full border text-sm transition-colors ${draftConfig.openingDirection === direction.id ? "border-[#131720] bg-[#131720] text-white" : "border-[#dbe0e6] text-[#657186] hover:border-[#131720]"}`}
                  >
                    {direction.name}
                    {direction.price ? ` (+ ${formatPriceWithCurrency(direction.price, item.product.currency)})` : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-[#eaedf0] pt-5">
            <div className="flex items-center justify-between gap-4">
              <span className="font-sans text-[14px] text-[#657186]">Updated item price</span>
              <span className="font-playfair font-medium text-[#131720] text-[28px]">
                {formatPriceWithCurrency(totalPrice, item.product.currency)}
              </span>
            </div>
            {saveError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {saveError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full border border-[#dbe0e6] hover:border-[#131720] text-[#131720] font-sans font-medium text-[15px] py-3 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="w-full bg-[#131720] hover:bg-black disabled:bg-[#9aa3af] disabled:cursor-not-allowed text-[#f9fafb] font-sans font-medium text-[15px] py-3 rounded-full transition-colors"
              >
                {isSaving ? "Saving..." : pricingLoaded ? "Save Changes" : "Loading..."}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
