"use client";

import { useState } from "react";

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is the blackout really 100%?",
      answer: "Yes. Our triple-layer fabric is certified to block 100% of light. Unlike cheap alternatives that leak light at the edges, the Lumina blind sits flush against your recess walls, eliminating side bleed entirely. If you don't get total blackout in your window, we'll replace it free."
    },
    {
      question: "How does the no-drill installation work?",
      answer: "The blind uses a spring tension bar. You extend the bar until it matches your window width, then press both ends firmly into the recess walls. The spring tension holds it securely without any fixings. It works in any recess between 5mm and 80mm deep."
    },
    {
      question: "What if I order the wrong size?",
      answer: "We offer free exchanges within 60 days. If you're unsure, use our measuring guide above — it covers everything you need to get the perfect fit. If you still have questions before ordering, email us and we'll guide you."
    },
    {
      question: "How do I clean it?",
      answer: "Spot clean with a damp cloth and mild soap. The fabric is wipe-clean and resistant to mould and mildew. Do not machine wash or submerge in water."
    },
    {
      question: "Do you offer custom sizes beyond the listed options?",
      answer: `Absolutely. Select "Custom" at checkout and enter your exact dimensions. We cut to any size from 20cm up to 250cm wide, and any drop from 30cm to 300cm. Custom orders are priced based on area — you'll see the price update as you type.`
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-[#eaedf0] py-16 md:py-24 px-6 relative w-full">
      <div className="max-w-[768px] mx-auto flex flex-col gap-8 md:gap-12 w-full">
        
        {/* Header */}
        <div className="flex flex-col gap-4 items-center w-full text-center">
          <p className="font-[family-name:var(--font-dm-sans)] font-medium text-[#4051b5] text-xs tracking-[1.2px] uppercase">
            FAQ
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[#131720] text-4xl md:text-[48px] leading-tight md:leading-[48px]">
            Questions & <br className="hidden md:block" />
            <span className="font-normal italic">answers</span>
          </h2>
        </div>

        {/* FAQ List */}
        <div className="flex flex-col w-full border-t border-[#dbe0e6]">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="border-b border-[#dbe0e6] flex flex-col w-full"
              >
                <div
                  className="flex items-center justify-between py-6 w-full cursor-pointer group hover:opacity-80 transition-opacity"
                  onClick={() => toggleFaq(i)}
                >
                  <h3 className="font-[family-name:var(--font-dm-sans)] font-medium text-[#131720] text-base leading-6 pr-4">
                    {faq.question}
                  </h3>
                    <div className="bg-[#eaedf0] flex items-center justify-center rounded-full size-7 shrink-0 relative">
                      <span className="absolute flex items-center justify-center w-full h-full text-[#131720]">
                        {isOpen ? (
                          <svg width="14" height="2" viewBox="0 0 14 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 0H14V2H0V0Z" fill="currentColor" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 6V0H8V6H14V8H8V14H6V8H0V6H6Z" fill="currentColor" />
                          </svg>
                        )}
                      </span>
                    </div>
                </div>
                {isOpen && (
                  <div className="pb-6 pr-12 w-full animate-in fade-in duration-300">
                    <p className="font-[family-name:var(--font-dm-sans)] font-normal text-[#657186] text-sm leading-[24px]">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Footer */}
        <div className="bg-[#f9fafb] flex flex-col gap-2 items-center p-8 rounded-2xl w-full text-center">
          <h3 className="font-[family-name:var(--font-playfair)] font-medium text-[#131720] text-xl leading-7">
            Still have questions?
          </h3>
          <p className="font-[family-name:var(--font-dm-sans)] font-normal text-[#657186] text-sm leading-5 pb-3">
            Our team replies within a few hours, Monday to Friday.
          </p>
          <a
            href="mailto:info@luminablackoutblinds.com"
            className="bg-[#131720] text-[#f9fafb] font-[family-name:var(--font-dm-sans)] font-medium text-sm leading-5 px-6 py-3 rounded-full hover:bg-black transition-colors"
          >
            info@luminablackoutblinds.com
          </a>
        </div>

      </div>
    </section>
  );
}