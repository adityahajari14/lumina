"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/hooks/useCheckout";
import { getComparePriceData } from "@/lib/compare-price";
import { formatPriceWithCurrency } from "@/lib/api";
import { formatCartConfiguration } from "@/lib/cart-format";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { trackStoreCartView } from "@/lib/store-events";
import { BLACKOUT_PRODUCT_PATH } from "@/lib/product-routes";
import LuminaFitPromiseModal from "@/components/product/LuminaFitPromiseModal";
import CartCustomizationModal from "@/components/cart/CartCustomizationModal";
import type { CartItem } from "@/types";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateCartItemConfiguration,
    updateQuantity,
    clearCart,
  } = useCart();
  const { checkout, isCheckingOut, checkoutError } = useCheckout();
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [isFitPromiseOpen, setIsFitPromiseOpen] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  useDialogFocus(isCartOpen, dialogRef, closeCart);
  useEffect(() => {
    if (isCartOpen && !wasOpen.current) trackStoreCartView(cart.items, cart.total);
    wasOpen.current = isCartOpen;
  }, [isCartOpen, cart]);

  const handleCheckout = async () => {
    await checkout(cart.items);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-60 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isCartOpen}
        inert={!isCartOpen}
      >
        <button
          type="button"
          className="absolute inset-0 bg-[#131720]/55"
          onClick={closeCart}
          aria-label="Close cart"
          tabIndex={isCartOpen ? 0 : -1}
        />
        <div
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          className={`absolute top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between gap-4 border-b border-[#eaedf0] px-5 py-5 shrink-0">
            <h2 className="font-playfair font-medium text-[#131720] text-[22px]">
              Your Cart{cart.itemCount > 0 ? ` (${cart.itemCount})` : ""}
            </h2>
            <button
              type="button"
              onClick={closeCart}
              className="w-9 h-9 rounded-full border border-[#dbe0e6] text-[#657186] hover:text-[#131720] hover:border-[#131720] transition-colors flex items-center justify-center shrink-0"
              aria-label="Close cart"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {cart.items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
              <p className="font-sans text-[#657186] text-[15px]">
                Your cart is empty. Build your custom Lumina blind to get started.
              </p>
              <Link
                href={BLACKOUT_PRODUCT_PATH}
                onClick={closeCart}
                className="inline-flex items-center justify-center bg-[#131720] text-white px-6 py-3 rounded-full font-medium hover:bg-black transition-colors"
              >
                Shop The Blind
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
                {cart.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex gap-4 ${idx !== cart.items.length - 1 ? "pb-5 border-b border-[#eaedf0]" : ""}`}
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#f8f9fb] shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    <div className="flex flex-col justify-between flex-1 min-w-0 gap-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <h3 className="font-sans font-semibold text-[#131720] text-[14px] truncate">
                            {item.product.name}
                          </h3>
                          <p className="font-sans text-[12px] text-[#657186] break-words leading-relaxed">
                            {formatCartConfiguration(item.configuration)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="font-sans font-medium text-[#131720] text-[14px]">
                            {formatPriceWithCurrency(item.product.price * item.quantity, item.product.currency)}
                          </span>
                          <span className="font-sans text-[11px] text-[#9aa3af] line-through">
                            {formatPriceWithCurrency(
                              getComparePriceData(item.product.price).compareAtPrice * item.quantity,
                              item.product.currency
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-[#eaedf0] rounded-full bg-[#f9fafb]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#657186] hover:text-[#131720] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                          <span className="font-sans text-[13px] font-medium text-[#131720] w-5 text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#657186] hover:text-[#131720] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="text-[#657186] hover:text-[#131720] transition-colors text-[12px] font-sans font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-[#657186] hover:text-red-500 transition-colors text-[12px] font-sans font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#eaedf0] px-5 py-5 flex flex-col gap-4 shrink-0">
                <div className="flex justify-between items-center font-sans text-[14px]">
                  <span className="text-[#657186]">Subtotal</span>
                  <span className="text-[#131720] font-medium">{formatPriceWithCurrency(cart.total)}</span>
                </div>

                {checkoutError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                    {checkoutError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsFitPromiseOpen(true)}
                  className="flex items-center justify-between gap-2 rounded-full border border-[#dbe0e6] bg-[#f9fafb] px-4 py-2 text-left transition-colors hover:border-[#131720]"
                >
                  <span className="flex items-center gap-2 font-sans text-[12px] font-semibold text-[#131720]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4051b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="8 12.5 10.5 15 16 9" />
                    </svg>
                    The Lumina Fit Promise
                  </span>
                  <span className="font-sans text-[11px] font-medium text-[#4051b5]">Learn More</span>
                </button>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-[#131720] hover:bg-black disabled:bg-[#9aa3af] text-[#f9fafb] font-sans font-medium text-[15px] py-3.5 rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                  {!isCheckingOut && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  )}
                </button>

                <div className="flex items-center justify-between">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="font-sans text-[12px] text-[#657186] hover:text-[#131720] transition-colors"
                  >
                    View full cart
                  </Link>
                  <button
                    onClick={clearCart}
                    className="font-sans text-[12px] text-[#657186] hover:text-[#131720] transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <CartCustomizationModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={updateCartItemConfiguration}
      />

      <LuminaFitPromiseModal open={isFitPromiseOpen} onClose={() => setIsFitPromiseOpen(false)} />
    </>
  );
}
