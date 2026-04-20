"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

type DraftOrderStatusResponse = {
  success: boolean;
  data?: {
    id: string;
    status: string;
    orderId: string | null;
    orderName: string | null;
    invoiceUrl: string;
    totalPrice: string;
    createdAt: string;
  };
  error?: { message: string };
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatStatus(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return "Payment confirmed";
    case "invoice_sent":
      return "Checkout open";
    default:
      return "Waiting for payment";
  }
}

export default function CheckoutConfirmationPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [statusData, setStatusData] = useState<DraftOrderStatusResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openedCheckout, setOpenedCheckout] = useState(false);
  const hasClearedCartRef = useRef(false);

  const draftOrderId = searchParams.get("draftOrderId");
  const checkoutUrl = searchParams.get("checkoutUrl");

  const headline = useMemo(() => {
    if (!statusData) {
      return "Confirming your order";
    }

    return statusData.status.toLowerCase() === "completed"
      ? "Your order is confirmed"
      : "Complete payment in Shopify";
  }, [statusData]);

  useEffect(() => {
    if (!checkoutUrl || openedCheckout) {
      return;
    }

    const popup = window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    setOpenedCheckout(Boolean(popup));
  }, [checkoutUrl, openedCheckout]);

  useEffect(() => {
    if (!draftOrderId) {
      setIsLoading(false);
      setError("Missing draft order reference. Please restart checkout from your cart.");
      return;
    }

    let isMounted = true;
    let pollTimer: number | null = null;

    const loadStatus = async () => {
      try {
        const response = await fetch(`/api/orders/status/${encodeURIComponent(draftOrderId)}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as DraftOrderStatusResponse;

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.error?.message || "Could not load checkout status");
        }

        if (!isMounted) {
          return;
        }

        setStatusData(payload.data);
        setError(null);
        setIsLoading(false);

        if (payload.data.status.toLowerCase() === "completed") {
          if (!hasClearedCartRef.current) {
            clearCart();
            hasClearedCartRef.current = true;
          }
          return;
        }

        pollTimer = window.setTimeout(loadStatus, 4000);
      } catch (statusError) {
        if (!isMounted) {
          return;
        }

        setIsLoading(false);
        setError(statusError instanceof Error ? statusError.message : "Could not load checkout status");
        pollTimer = window.setTimeout(loadStatus, 6000);
      }
    };

    loadStatus();

    return () => {
      isMounted = false;
      if (pollTimer) {
        window.clearTimeout(pollTimer);
      }
    };
  }, [clearCart, draftOrderId]);

  const currentCheckoutUrl = statusData?.invoiceUrl || checkoutUrl;
  const isCompleted = statusData?.status.toLowerCase() === "completed";

  return (
    <main className="w-full bg-[#f9fafb]">
      <section className="relative overflow-hidden bg-[#eaedf0] px-4 py-12 md:px-6 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.88),transparent_34%),linear-gradient(135deg,rgba(234,237,240,0.28),rgba(255,255,255,0.76))]" />
        <div className="relative mx-auto flex w-full max-w-[1248px] flex-col gap-5">
          <span className="inline-flex w-fit rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#657186]">
            Checkout confirmation
          </span>
          <h1 className="max-w-3xl font-playfair text-4xl font-medium leading-tight text-[#131720] md:text-[56px]">
            {headline}
          </h1>
          <p className="max-w-2xl text-[15px] leading-7 text-[#657186]">
            Keep this page open while you finish payment in Shopify. We&apos;ll verify the draft order automatically and keep your Lumina confirmation state here.
          </p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[1248px] gap-6 px-4 py-8 md:px-6 md:py-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
        <section className="rounded-[28px] border border-[#eaedf0] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                isCompleted
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-[#dbe0e6] bg-[#f8fafc] text-[#657186]"
              }`}
            >
              {statusData ? formatStatus(statusData.status) : "Checking status"}
            </span>
            {draftOrderId && (
              <span className="text-xs uppercase tracking-[0.14em] text-[#9aa3af]">
                Draft order {draftOrderId}
              </span>
            )}
          </div>

          <div className="mt-6 rounded-[24px] bg-[#fbfcfd] p-5">
            <h2 className="font-playfair text-2xl text-[#131720]">What happens next</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#9aa3af]">1</p>
                <p className="mt-2 text-sm leading-6 text-[#131720]">Open the secure Shopify checkout and complete payment.</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#9aa3af]">2</p>
                <p className="mt-2 text-sm leading-6 text-[#131720]">This page polls Shopify until the draft order flips to paid.</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#9aa3af]">3</p>
                <p className="mt-2 text-sm leading-6 text-[#131720]">Your paid order then appears inside your Lumina account history.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {currentCheckoutUrl && !isCompleted && (
              <a
                href={currentCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#131720] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
              >
                Open secure checkout
              </a>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-full border border-[#dbe0e6] px-6 py-3 text-sm font-medium text-[#131720] transition-colors hover:border-[#131720]"
            >
              Refresh status
            </button>
            <Link
              href={isCompleted ? "/account" : "/cart"}
              className="inline-flex items-center justify-center rounded-full border border-[#dbe0e6] px-6 py-3 text-sm font-medium text-[#131720] transition-colors hover:border-[#131720]"
            >
              {isCompleted ? "View my account" : "Back to cart"}
            </Link>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="mt-6 rounded-2xl border border-[#edf1f6] bg-[#fbfcfd] px-4 py-3 text-sm text-[#657186]">
              Checking Shopify for the latest payment status...
            </div>
          )}

          {isCompleted && statusData && (
            <div className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="font-playfair text-2xl text-emerald-900">Payment received</h3>
              <p className="mt-2 text-sm leading-6 text-emerald-900/80">
                Shopify marked this draft order as completed for {statusData.orderName || "your order"}. Your account timeline will continue syncing in the background.
              </p>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-[24px] border border-[#eaedf0] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9aa3af]">Order snapshot</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-[#9aa3af]">Status</dt>
                <dd className="mt-1 text-[#131720]">{statusData ? formatStatus(statusData.status) : "Waiting for Shopify"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-[#9aa3af]">Order ref</dt>
                <dd className="mt-1 text-[#131720]">{statusData?.orderName || "Assigned after payment"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-[#9aa3af]">Created</dt>
                <dd className="mt-1 text-[#131720]">{statusData ? formatDate(statusData.createdAt) : "-"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-[#9aa3af]">Total</dt>
                <dd className="mt-1 text-[#131720]">{statusData?.totalPrice || "-"}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[24px] border border-[#eaedf0] bg-white p-6 shadow-sm">
            <h2 className="font-playfair text-2xl text-[#131720]">Need a hand?</h2>
            <p className="mt-3 text-sm leading-6 text-[#657186]">
              If payment has gone through but this page hasn&apos;t updated yet, give it a few seconds and refresh. Draft-order completion and webhook sync usually land quickly, but they can arrive slightly out of sequence.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
