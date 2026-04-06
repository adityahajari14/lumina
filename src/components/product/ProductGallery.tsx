"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Product } from "@/types";

interface ProductGalleryProps {
  product: Product;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const images = product.images;

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  if (images.length === 0) {
    return (
      <div className="flex flex-col gap-3 w-full self-start z-10">
        <div className="bg-[#eaedf0] rounded-2xl w-full h-[584px] flex items-center justify-center">
          <span className="font-sans text-sm text-[#657186]">No product images available</span>
        </div>
      </div>
    );
  }

  const getAltText = (index: number) =>
    product.imageAlts[index] || `${product.name} image ${index + 1}`;

  return (
    <div className="flex flex-col gap-3 w-full self-start z-10">       
      {/* Main Image */}
      <div 
        className="bg-[#eaedf0] rounded-2xl w-full h-[584px] relative overflow-hidden flex items-center justify-center cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <Image
          src={images[activeIdx] || images[0]}
          alt={getAltText(activeIdx)}
          fill
          className="object-cover"
          priority
          loading="eager"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {/* Navigation Arrows (Stop propagation so they don't trigger modal) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveIdx(activeIdx > 0 ? activeIdx - 1 : images.length - 1);
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur w-9 h-9 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveIdx(activeIdx < images.length - 1 ? activeIdx + 1 : 0);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur w-9 h-9 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#131720]">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 flex gap-2 items-center justify-center w-full z-10">
            {images.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? 'w-8 bg-[#131720]' : 'w-1.5 bg-[#131720]/30'}`}
                />
            ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-2 w-full">
        {images.slice(0, 5).map((src, idx) => {
          if (idx === 4 && images.length > 4) {
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveIdx(idx);
                  setIsModalOpen(true);
                }}
                className="relative rounded-xl overflow-hidden aspect-square ring-0 opacity-80 hover:opacity-100 transition-all bg-black"
              >
                <Image
                  src={src}
                  alt={getAltText(idx)}
                  fill
                  className="object-cover opacity-60"
                  sizes="(max-width: 768px) 20vw, 10vw"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xl font-medium">+{images.length - 4}</span>
                </div>
              </button>
            );
          }
          
          return (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`relative rounded-xl overflow-hidden aspect-square ${activeIdx === idx ? 'ring-2 ring-offset-2 ring-[#131720]' : 'ring-1 ring-[#eaedf0] opacity-80 hover:opacity-100'} transition-all`}
            >
              <Image
                src={src}
                alt={getAltText(idx)}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 20vw, 10vw"
              />
            </button>
          )
        })}
      </div>

      {/* Popup Gallery Modal (Amazon Style Box) */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center p-4 md:p-8 pt-24 md:pt-28 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Centered Modal Container */}
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[80vh] h-full flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#eaedf0] shrink-0 bg-white z-10">
              <h2 className="font-playfair text-xl font-medium text-[#131720]">Product Images</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#657186] hover:bg-gray-100 hover:text-[#131720] rounded-full transition-colors"
                aria-label="Close gallery"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Layout Body */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-white">
              {/* Thumbnail Sidebar (Desktop) / Horizontal Strip (Mobile) */}
              <div className="flex md:flex-col gap-3 p-4 border-b md:border-b-0 md:border-r border-[#eaedf0] overflow-x-auto md:overflow-y-auto shrink-0 md:w-32 bg-white z-10">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`relative h-20 w-20 md:w-full shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${activeIdx === idx ? 'border-[#131720]' : 'border-transparent hover:border-[#eaedf0]'}`}
                  >
                    <Image
                      src={src}
                      alt={getAltText(idx)}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image Area */}
              <div className="flex flex-1 relative bg-[#f8f9fb] items-center justify-center p-4 min-h-[50vh]">
                <button
                  onClick={() => setActiveIdx(activeIdx > 0 ? activeIdx - 1 : images.length - 1)}
                  className="absolute left-4 bg-white/80 hover:bg-white p-3 rounded-full text-[#131720] shadow-sm transition-colors z-20"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>

                <div className="relative w-full h-full max-w-3xl flex items-center justify-center">
                  <Image
                    src={images[activeIdx] || images[0]}
                    alt={getAltText(activeIdx)}
                    fill
                    className="object-contain mix-blend-multiply"
                    sizes="(max-width: 1024px) 100vw, 800px"
                    priority
                    loading="eager"
                  />
                </div>

                <button
                   onClick={() => setActiveIdx(activeIdx < images.length - 1 ? activeIdx + 1 : 0)}
                   className="absolute right-4 bg-white/80 hover:bg-white p-3 rounded-full text-[#131720] shadow-sm transition-colors z-20"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
