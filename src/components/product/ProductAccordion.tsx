"use client";

import { useState } from "react";
import type { ProductAccordionItem } from "@/types";

interface ProductAccordionProps {
  items: ProductAccordionItem[];
}

export default function ProductAccordion({ items }: ProductAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <div key={`${item.title}-${i}`} className="border-b border-[#dbe0e6]">
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-center justify-between py-5 text-left transition-colors hover:text-[#4051b5]"
          >
            <span className="font-playfair font-medium text-[16px] text-[#131720]">
              {item.title}
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-[#131720] transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            {item.contentHtml ? (
              <div
                className="prose prose-sm max-w-none text-[#657186] [&_p]:my-0 [&_strong]:text-[#131720] [&_ul]:my-0 [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: item.contentHtml }}
              />
            ) : (
              <p className="font-sans text-[#657186] text-[14px] leading-relaxed">
                {item.content}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
