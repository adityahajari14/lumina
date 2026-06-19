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
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="currentColor"
              className="text-[#131720] transition-transform duration-300"
            >
              {openIndex === i ? (
                <path d="M0 6H14V8H0V6Z" />
              ) : (
                <path d="M6 6V0H8V6H14V8H8V14H6V8H0V6H6Z" />
              )}
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            {item.contentHtml ? (
              <div
                className="prose prose-sm max-w-none text-[#657186] [&_p]:my-0 [&_strong]:text-[#131720] [&_ul]:my-0 [&_ul]:pl-5 [&_a]:text-[#4051b5] [&_a]:font-medium [&_a]:underline-offset-2 [&_a]:underline hover:[&_a]:text-[#2f3e8a]"
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
