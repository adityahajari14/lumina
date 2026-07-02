"use client";

import { useState } from "react";
import { MEASURING_GUIDE_PATH } from "@/lib/product-routes";

interface PromiseSection {
  title: string;
  content: React.ReactNode;
}

const SECTIONS: PromiseSection[] = [
  {
    title: "Accurate measurement guidance",
    content: (
      <p>
        Every blind is cut to the exact width and drop you enter at checkout, with a standard
        +/-4mm manufacturing tolerance. Not sure you measured right?{" "}
        <a
          href={MEASURING_GUIDE_PATH}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4051b5] font-medium underline underline-offset-2 hover:text-[#2f3e8a]"
        >
          View our measuring guide
        </a>{" "}
        before you order, or email us a photo of your window at{" "}
        <span className="font-medium text-[#131720]">info@luminablackoutblinds.com</span> and
        we&apos;ll help you get it right.
      </p>
    ),
  },
  {
    title: "1-year manufacturer's guarantee",
    content: (
      <p>
        Every blind is covered against manufacturing faults for a full year from delivery.
        If a fault is confirmed, we&apos;ll repair or replace it at no extra cost.
      </p>
    ),
  },
  {
    title: "Fault protection on delivery",
    content: (
      <p>
        If your blind arrives damaged or with a manufacturing fault, contact us within{" "}
        <span className="font-medium text-[#131720]">3 business days</span> of delivery with
        your order number and photos. We aim to respond within 1 business day and will arrange
        a free replacement once the fault is confirmed.
      </p>
    ),
  },
  {
    title: "Still unsure about your window?",
    content: (
      <p>
        Lumina blinds are designed for recessed windows with a recess depth between{" "}
        <span className="font-medium text-[#131720]">5mm and 80mm</span>. If you&apos;re not sure
        your window qualifies, email us a photo at{" "}
        <span className="font-medium text-[#131720]">info@luminablackoutblinds.com</span> and
        we&apos;ll confirm fit before you order.
      </p>
    ),
  },
];

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4051b5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" stroke="#4051b5" fill="none" />
      <polyline points="8 12.5 10.5 15 16 9" />
    </svg>
  );
}

interface LuminaFitPromiseModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LuminaFitPromiseModal({ open, onClose }: LuminaFitPromiseModalProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!open) return null;

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="The Lumina Fit Promise"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-140 max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full text-[#657186] transition-colors hover:bg-[#f9fafb] hover:text-[#131720]"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-3 text-center pr-8">
          <h2 className="font-playfair font-medium text-[26px] text-[#131720] leading-tight">
            The Lumina Fit Promise
          </h2>
          <p className="font-sans text-[14px] leading-6 text-[#657186] max-w-100">
            Buying custom blinds online should feel straightforward. This is what you can expect
            with Lumina.
          </p>
        </div>

        <div className="mt-6 border-t border-[#dbe0e6]">
          {SECTIONS.map((section, i) => (
            <div key={section.title} className="border-b border-[#dbe0e6]">
              <button
                type="button"
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-3 py-5 text-left"
              >
                <span className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="font-sans font-medium text-[15px] text-[#131720]">
                    {section.title}
                  </span>
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="currentColor"
                  className="shrink-0 text-[#131720] transition-transform duration-300"
                >
                  {openIndex === i ? (
                    <path d="M0 6H14V8H0V6Z" />
                  ) : (
                    <path d="M6 6V0H8V6H14V8H8V14H6V8H0V6H6Z" />
                  )}
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-60 pb-5 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="pl-7 font-sans text-[13px] leading-6 text-[#657186]">
                  {section.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
