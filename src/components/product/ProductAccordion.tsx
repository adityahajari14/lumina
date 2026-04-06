"use client";

import { useState } from "react";

const accordionData = [
  {
    title: "Product Details",
    content:
      "Our total blackout blinds block 100% of light, perfect for bedrooms, nurseries, or media rooms. The specially coated thermal backing also helps insulate your home, keeping it warmer in winter and cooler in summer.",
  },
  {
    title: "Specifications",
    content:
      "Material: 100% Polyester with thermal blackout coating. Wipe clean only. Safety: Complies with all child safety regulations. Maximum Drop: 200cm.",
  },
  {
    title: "Measuring & Installation",
    content:
      "Detailed measuring and fitting instructions are included with every order. If you need help, our customer service team is available via chat or phone.",
  },
  {
    title: "Delivery & Returns",
    content:
      "Standard delivery takes 3-5 working days. We offer free returns within 60 days if you're not completely satisfied with your purchase.",
  },
];

export default function ProductAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col">
      {accordionData.map((item, i) => (
        <div key={i} className="border-b border-[#dbe0e6]">
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
            <p className="font-sans text-[#657186] text-[14px] leading-relaxed">
              {item.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
