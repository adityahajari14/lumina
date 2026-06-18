"use client";

import { useState } from "react";

const SNIPPET_FAQS = [
  {
    question: "Is the blackout really 100%?",
    answer:
      "Yes. Our triple-layer fabric is certified to block 100% of light. The Lumina blind sits flush against your recess walls, eliminating side bleed entirely. If you don't get total blackout, we'll replace it free.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Every Lumina blind is made to order. From the time you place your order, you can expect delivery within 7–11 business days. Once your blind ships, you'll receive a tracking number by email.",
  },
  {
    question: "What if I want to return it?",
    answer:
      "Because every blind is cut to your exact measurements, we're unable to accept returns on made-to-measure orders unless the product is faulty. If your blind arrives damaged or defective, contact us within 3 business days and we'll arrange a replacement free of charge.",
  },
];

export default function HeroFaqSnippet() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full bg-[#f9fafb] border-t border-[#dbe0e6] px-6 py-12">
      <div className="max-w-[768px] mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="font-playfair font-medium text-[#131720] text-2xl">
            Quick <span className="font-normal italic">answers</span>
          </h2>
          <a
            href="#faq"
            className="font-sans text-[13px] text-[#657186] underline underline-offset-2 hover:text-[#131720] transition-colors"
          >
            See all questions
          </a>
        </div>

        <div className="flex flex-col border-t border-[#dbe0e6]">
          {SNIPPET_FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="border-b border-[#dbe0e6]">
                <button
                  type="button"
                  className="flex items-center justify-between w-full py-5 text-left group"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="font-sans font-medium text-[#131720] text-[15px] pr-4">
                    {faq.question}
                  </span>
                  <span className="shrink-0 bg-[#eaedf0] rounded-full w-7 h-7 flex items-center justify-center text-[#131720]">
                    {isOpen ? (
                      <svg width="12" height="2" viewBox="0 0 14 2" fill="none">
                        <path d="M0 0H14V2H0V0Z" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <path d="M6 6V0H8V6H14V8H8V14H6V8H0V6H6Z" fill="currentColor" />
                      </svg>
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div className="pb-5 pr-10 animate-in fade-in duration-200">
                    <p className="font-sans text-[14px] text-[#657186] leading-6">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
