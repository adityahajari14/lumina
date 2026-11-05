"use client";

import { useState } from "react";
import SaleCountdown from "@/components/common/SaleCountdown";
import SaleTagIcon from "@/components/common/SaleTagIcon";
import { SEASONAL_SALE } from "@/lib/seasonal-theme";

const OFFER_TEXT = SEASONAL_SALE
  ? SEASONAL_SALE.announcement
  : "Our Biggest Sale | Up to 60% Off + Extra 15% with Code FINAL15";
const OFFER_CODE = "FINAL15";

export default function TopBar() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(OFFER_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy offer code:", error);
    }
  };

  return (
    <div className={`w-full border-b bg-black ${SEASONAL_SALE ? "border-amber-400/30" : "border-white/10"}`}>
      <div className="mx-auto flex min-h-10 max-w-[1280px] flex-col items-center justify-center gap-1.5 px-4 py-2.5 text-center md:flex-row md:gap-4">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-white sm:text-[12px] md:text-[13px] flex items-center gap-2 flex-wrap justify-center">
          {SEASONAL_SALE && <SaleTagIcon className="shrink-0 text-amber-300" />}
          <span>{OFFER_TEXT}</span>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-full border px-3 transition-colors ${SEASONAL_SALE ? "border-amber-300/40 bg-amber-300/10 text-amber-200 hover:bg-amber-300/20" : "border-white/18 bg-white/8 text-white hover:bg-white/14"}`}
          aria-label={copied ? `Copied discount code ${OFFER_CODE}` : `Copy discount code ${OFFER_CODE}`}
          title={copied ? "Copied" : `Copy ${OFFER_CODE}`}
        >
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] sm:text-[12px]">
            {copied ? "Copied " : "Use "}
            {OFFER_CODE}
          </span>
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5"></path>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
        <SaleCountdown variant="topbar" />
        </div>
      </div>
    </div>
  );
}
