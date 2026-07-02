"use client";

import Image from "next/image";

interface OpeningDirectionGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OpeningDirectionGuideModal({ open, onClose }: OpeningDirectionGuideModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Opening Direction Options"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#dbe0e6] px-6 py-4">
          <h2 className="font-playfair font-semibold text-[22px] text-[#131720]">
            Opening Direction Options
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dbe0e6] text-[#657186] transition-colors hover:bg-[#f9fafb] hover:text-[#131720]"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <Image
            src="/product/openingDirGuide.webp"
            alt="Opening direction options: Left to Right, Right to Left, Top Down, and Split"
            width={1675}
            height={939}
            sizes="(max-width: 768px) 100vw, 900px"
            className="h-auto w-full rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
