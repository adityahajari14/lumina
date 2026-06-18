"use client";

import { useState } from "react";

const INITIAL_VISIBLE = 5;

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

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
      question: "How do I clean it?",
      answer: "Spot clean with a damp cloth and mild soap. The fabric is wipe-clean and resistant to mould and mildew. Do not machine wash or submerge in water."
    },
    {
      question: "Do you offer custom sizes beyond the listed options?",
      answer: `Absolutely. Select "Custom" at checkout and enter your exact dimensions. We cut to any size from 20cm up to 250cm wide, and any drop from 30cm to 300cm. Custom orders are priced based on area — you'll see the price update as you type.`
    },
    {
      question: "How long does delivery take?",
      answer: "Every Lumina blind is made to order. From the time you place your order, you can expect delivery within 7–11 business days. That window covers production, quality check, and shipping to your door. Once your blind ships, you'll receive a tracking number by email."
    },
    {
      question: "How much does shipping cost?",
      answer: "Nothing. Lumina offers free shipping on every order with no minimum spend. We currently ship within the United States only. We're unable to deliver to PO boxes, military addresses, or international addresses at this time."
    },
    {
      question: "What if my blind arrives damaged or faulty?",
      answer: "Contact us at info@luminablackoutblinds.com within 3 business days of delivery. Include your order number, a description of the issue, and photos if possible. Do not install the blind until we've reviewed your claim, as installation can affect our ability to assess the fault. We aim to respond within 1 business day and will arrange a replacement if a manufacturing fault or transit damage is confirmed."
    },
    {
      question: "Can I cancel or change my order after placing it?",
      answer: "Because every blind is cut to your exact measurements and goes into production shortly after your order is confirmed, we're usually unable to make changes or cancel once production has started. Please double-check your measurements and selections carefully before ordering. If you spot an error immediately after placing your order, email us as soon as possible and we'll do our best to catch it before production begins."
    },
    {
      question: "What does the warranty cover?",
      answer: "Every Lumina blind comes with a 1-year manufacturer's guarantee against confirmed manufacturing faults. It does not cover normal wear and tear, accidental damage, incorrect installation, alterations, or fading from prolonged sunlight exposure. As with all made-to-measure blinds, a manufacturing tolerance of +/- 4mm is standard and does not constitute a fault."
    },
    {
      question: "What colors and frame options are available?",
      answer: "The blind fabric comes in four colors: White, Cream, Graphite, and Sky Blue. Frames are available in White or Graphite. All combinations can be selected on the product page before adding to cart."
    },
    {
      question: "Does the blind work on any window type?",
      answer: "The Lumina blind is designed specifically for recessed windows — windows with a recess depth of at least 5mm and up to 80mm. The tension bar sits inside the recess, which is what gives the flush, edge-to-edge blackout. It is not suitable for flat-wall mounting or non-recessed frames."
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
          {(showAll ? faqs : faqs.slice(0, INITIAL_VISIBLE)).map((faq, i) => {
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

        {/* View more / less */}
        {faqs.length > INITIAL_VISIBLE && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="self-center mt-2 rounded-full border border-[#b8bec7] bg-white px-6 py-2.5 font-sans text-[14px] text-[#131720] shadow-sm transition-colors hover:bg-[#f7f8f8]"
          >
            {showAll ? "View less" : "View more"}
          </button>
        )}

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