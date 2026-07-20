"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getComparePriceData } from "@/lib/compare-price";
import {
  createCheckout,
  fetchCustomizationPricing,
  fetchPriceMatrix,
  formatPriceWithCurrency,
  validateCartPrice,
} from "@/lib/api";
import { calculateTotalPrice, configToCustomizations, getTotalInches } from "@/lib/pricing";
import { trackClarityInitiateCheckout } from "@/lib/clarity";
import { trackInitiateCheckout } from "@/lib/meta-pixel";
import { getStoreSessionContext, trackStoreCartView, trackStoreCheckoutInitiated } from "@/lib/store-events";
import { BLACKOUT_PRODUCT_PATH } from "@/lib/product-routes";
import {
  BLIND_COLOR_LABELS,
  BLIND_COLOR_OPTIONS,
  FRAME_COLOR_LABELS,
  FRAME_COLOR_OPTIONS,
  OPENING_DIRECTION_LABELS,
  OPENING_DIRECTION_OPTIONS,
} from "@/data/customizations";
import type {
  CartItem,
  CheckoutItemRequest,
  CustomizationPricing,
  PriceBandMatrix,
  ProductConfiguration,
} from "@/types";

function formatConfiguration(config: ProductConfiguration) {
  const unit = config.widthUnit === "cm" ? "cm" : "in";
  const parts = [`${config.width}×${config.height}${unit}`];

  if (config.blindColor) parts.push(BLIND_COLOR_LABELS[config.blindColor] || config.blindColor);
  if (config.frameColor) parts.push(FRAME_COLOR_LABELS[config.frameColor] || config.frameColor);
  if (config.openingDirection) parts.push(OPENING_DIRECTION_LABELS[config.openingDirection] || config.openingDirection);

  return parts.join(" · ");
}

interface CartCustomizationModalProps {
  item: CartItem | null;
  onClose: () => void;
  onSave: (itemId: string, configuration: ProductConfiguration, productPrice: number) => void;
}

function CartCustomizationModal({ item, onClose, onSave }: CartCustomizationModalProps) {
  const [draftConfig, setDraftConfig] = useState<ProductConfiguration | null>(null);
  const [pricingLoaded, setPricingLoaded] = useState(false);
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
  }, [item]);

  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-[#131720]/55"
        onClick={onClose}
        aria-label="Close customisation editor"
      />
      <div
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

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateCartItemConfiguration, updateQuantity, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const hasTrackedCartViewRef = useRef(false);

  useEffect(() => {
    if (hasTrackedCartViewRef.current || cart.items.length === 0) return;
    hasTrackedCartViewRef.current = true;
    trackStoreCartView(cart.items, cart.total);
  }, [cart]);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError(null);

    const currency = cart.items[0]?.product.currency || "USD";
    trackClarityInitiateCheckout(cart.items);
    trackInitiateCheckout(cart.items, currency);
    trackStoreCheckoutInitiated(cart.items, cart.total);

    try {
      const items: CheckoutItemRequest[] = cart.items.map((item) => ({
        handle: item.product.slug,
        widthInches: getTotalInches(
          item.configuration.width,
          item.configuration.widthFraction,
          item.configuration.widthUnit
        ),
        heightInches: getTotalInches(
          item.configuration.height,
          item.configuration.heightFraction,
          item.configuration.heightUnit
        ),
        quantity: item.quantity,
        submittedPrice: item.product.price,
        configuration: {
          blindName: item.configuration.blindName || item.product.name,
          blindColor: item.configuration.blindColor || undefined,
          frameColor: item.configuration.frameColor || undefined,
          openingDirection: item.configuration.openingDirection || undefined,
        },
      }));

      const result = await createCheckout(items, undefined, getStoreSessionContext());
      clearCart();
      window.location.href = result.checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutError(error instanceof Error ? error.message : "Checkout failed");
      setIsCheckingOut(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="w-full min-h-screen bg-[#f9fafb] pt-8 md:pt-16 pb-20">
        <div className="max-w-[1248px] mx-auto px-4 md:px-6">
          <div className="bg-white rounded-[24px] p-8 md:p-12 border border-[#eaedf0] text-center">
            <h1 className="font-playfair font-medium text-[#131720] text-4xl mb-3">Your Cart</h1>
            <p className="font-sans text-[#657186] text-[15px] mb-8">
              Your cart is empty. Build your custom Lumina blind to get started.
            </p>
            <Link
              href={BLACKOUT_PRODUCT_PATH}
              className="inline-flex items-center justify-center bg-[#131720] text-white px-6 py-3 rounded-full font-medium hover:bg-black transition-colors"
            >
              Shop The Blind
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.total;
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="w-full min-h-screen bg-[#f9fafb] pt-8 md:pt-16 pb-20">
      <div className="max-w-[1248px] mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-2 mb-10 md:mb-14">
          <Link href={BLACKOUT_PRODUCT_PATH} className="text-[#657186] font-sans text-sm hover:text-[#131720] transition-colors flex items-center gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Continue Shopping
          </Link>
          <h1 className="font-playfair font-medium text-[#131720] text-4xl lg:text-[48px] leading-tight">
            Your Cart
          </h1>
          <p className="font-sans text-[#657186] text-[15px]">
            {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="col-span-1 lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-[24px] p-4 md:p-6 shadow-sm border border-[#eaedf0] flex flex-col gap-6">
              {cart.items.map((item, idx) => {
                return (
                  <div key={item.id} className={`flex flex-col sm:flex-row gap-6 ${idx !== cart.items.length - 1 ? 'pb-6 border-b border-[#eaedf0]' : ''}`}>
                    <div className="relative w-full sm:w-[140px] aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-[#f8f9fb] shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 140px"
                      />
                    </div>

                    <div className="flex flex-col justify-between flex-1 gap-4 sm:gap-0">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex flex-col gap-1.5">
                          <h3 className="font-playfair font-medium text-[#131720] text-[18px]">
                            {item.product.name}
                          </h3>
                          <p className="font-sans text-[14px] text-[#657186]">
                            {formatConfiguration(item.configuration)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="font-sans font-medium text-[#131720] text-[16px]">
                            {formatPriceWithCurrency(item.product.price * item.quantity, item.product.currency)}
                          </div>
                          <div className="font-sans text-[13px] text-[#9aa3af] line-through">
                            {formatPriceWithCurrency(
                              getComparePriceData(item.product.price).compareAtPrice * item.quantity,
                              item.product.currency
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center border border-[#eaedf0] rounded-full bg-[#f9fafb]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center text-[#657186] hover:text-[#131720] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                          <span className="font-sans text-[14px] font-medium text-[#131720] w-6 text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center text-[#657186] hover:text-[#131720] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="text-[#657186] hover:text-[#131720] transition-colors flex items-center gap-1.5 text-[13px] font-sans font-medium"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"></path>
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                            </svg>
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-[#657186] hover:text-red-500 transition-colors flex items-center gap-1.5 text-[13px] font-sans font-medium"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#eaedf0]/50 rounded-[16px] p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-sans font-medium text-[13px] text-[#131720]">1 Year Guarantee</span>
                  <span className="font-sans text-[12px] text-[#657186]">Manufacturer backed cover</span>
                </div>
              </div>
              <div className="bg-[#eaedf0]/50 rounded-[16px] p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-sans font-medium text-[13px] text-[#131720]">Secure Checkout</span>
                  <span className="font-sans text-[12px] text-[#657186]">SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-[#eaedf0] sticky top-28 flex flex-col gap-6">
              <h2 className="font-playfair font-medium text-[#131720] text-[24px]">
                Order Summary
              </h2>

              <div className="flex flex-col gap-4 font-sans text-[15px]">
                <div className="flex justify-between items-center text-[#657186]">
                  <span>Subtotal</span>
                  <span className="text-[#131720] font-medium">{formatPriceWithCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[#657186]">
                  <span>Shipping</span>
                  <span className="text-[#131720] font-medium">{shipping === 0 ? "Free" : formatPriceWithCurrency(shipping)}</span>
                </div>

                <div className="w-full h-[1px] bg-[#eaedf0] my-2"></div>

                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[#131720] font-medium text-[18px]">Total</span>
                    <span className="text-[#657186] text-[12px] mt-0.5">Sales tax calculated at checkout</span>
                  </div>
                  <span className="font-playfair text-[#131720] font-medium text-[28px]">
                    {formatPriceWithCurrency(total)}
                  </span>
                </div>
              </div>

              {checkoutError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {checkoutError}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-[#131720] hover:bg-black disabled:bg-[#9aa3af] text-[#f9fafb] font-sans font-medium text-[16px] py-4 rounded-full transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                {!isCheckingOut && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                )}
              </button>

              <button
                onClick={clearCart}
                className="w-full border border-[#dbe0e6] hover:border-[#131720] text-[#131720] font-sans font-medium text-[15px] py-3 rounded-full transition-colors"
              >
                Clear Cart
              </button>

              <div className="flex items-center justify-center gap-2 text-[#657186] text-[12px] font-sans mt-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Delivered within 7-11 working days.
              </div>
            </div>
          </div>
        </div>
      </div>

      <CartCustomizationModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={updateCartItemConfiguration}
      />
    </div>
  );
}
