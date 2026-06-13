"use client";

import { useState } from "react";
import SaleCountdown from "@/components/common/SaleCountdown";

const OFFER_TEXT = "Our Biggest Sale | Up to 60% Off + Extra 10% with Code FINAL10 | Ends in";
const OFFER_CODE = "FINAL10";

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
    <div className="w-full bg-[#000] border-b border-white/10">
      <div className="mx-auto flex min-h-10 max-w-[1280px] flex-col items-center justify-center gap-2 px-4 py-2 text-center sm:flex-row sm:gap-3">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-white sm:text-[12px] md:text-[13px] flex items-center gap-2 flex-wrap justify-center">
          <span>{OFFER_TEXT}</span>
          <SaleCountdown variant="topbar" />
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-white/18 bg-white/8 px-3 text-white transition-colors hover:bg-white/14"
          aria-label={copied ? `Copied discount code ${OFFER_CODE}` : `Copy discount code ${OFFER_CODE}`}
          title={copied ? "Copied" : `Copy ${OFFER_CODE}`}
        >
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-white sm:text-[12px]">
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
      </div>
    </div>
  );
}
