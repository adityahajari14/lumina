import Image from 'next/image';
import Link from 'next/link';
import { BLACKOUT_PRODUCT_PATH } from '@/lib/product-routes';

export default function OurStory() {
  return (
    <section className="bg-[#eaedf0] w-full flex flex-col items-center py-16 lg:py-[96px] px-6">
      <div className="w-full max-w-[1280px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[96px] items-center">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="flex flex-col items-start w-full lg:hidden order-1 lg:order-none">
          <span className="font-sans font-medium text-[#4051b5] text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-4">
            Our Story
          </span>
          <h2 className="font-playfair font-medium text-[#131720] text-4xl leading-tight flex flex-col mb-2">
            <span>Built for people who</span>
            <span className="font-normal italic">take sleep seriously</span>    
          </h2>
        </div>

        {/* Left Column - Images */}
        <div className="relative w-full h-[500px] lg:h-[710px] order-2 lg:order-1">
          {/* Main Image */}
          <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-zinc-200">
            <Image 
              src="/home/ourstory-img1.png" 
              alt="Lumina blind in a calm bedroom"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Overlay Swatch Image */}
          {/* <div className="absolute -bottom-5 -right-4 lg:-right-8 w-[120px] lg:w-[160px] h-[150px] lg:h-[208px] bg-white border-4 border-[#f9fafb] rounded-[16px] p-1 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] z-10 hidden sm:block">
            <div className="relative w-full h-full rounded-[12px] overflow-hidden bg-zinc-300">
              <Image 
                src="/home/hero-img1.webp" 
                alt="Close up of the blind fabric" 
                fill 
                className="object-cover"
              />
            </div>
          </div> */}
        </div>

        {/* Right Column - Text Content */}
        <div className="flex flex-col items-start order-3 lg:order-2 w-full max-w-[600px] justify-self-center lg:justify-self-start">
          
          {/* Eyebrow */}
          <span className="hidden lg:block font-sans font-medium text-[#4051b5] text-[12px] tracking-[1.2px] uppercase leading-[16px] mb-8">
            Our Story
          </span>

          {/* Heading */}
          <h2 className="hidden lg:flex font-playfair font-medium text-[#131720] text-4xl lg:text-[48px] leading-tight lg:leading-[48px] flex-col mb-8">
            <span>Built for people who</span>
            <span className="font-normal italic">take sleep seriously</span>
          </h2>

          {/* Body Text */}
          <div className="font-sans font-normal text-[#657186] text-base lg:text-[16px] leading-[26px] flex flex-col gap-[26px] mb-10">
            <p>
              Lumina started with a simple frustration: every blackout blind on the market
              either leaked light, looked cheap, or required drilling into rented walls. We
              spent three years building something better.
            </p>
            <p>
              Today, our blinds are trusted in over 40,000 homes — Every blind is made
              to your exact measurements, is delivered within 14-18 working days, and installs without a
              single drill hole.
            </p>
          </div>

          {/* CTA Button */}
          <Link 
            href={BLACKOUT_PRODUCT_PATH}
            className="flex items-center gap-2 bg-[#131720] text-[#f9fafb] font-sans font-medium text-[14px] leading-[20px] px-[28px] py-[14px] rounded-full hover:bg-black transition-colors mb-12 lg:mb-16"
          >
            See the Blind
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Link>

          {/* Stats Grid */}
          <div className="w-full pt-8 border-t border-[#dbe0e6] grid grid-cols-2 gap-y-8 gap-x-5">
            
            <div className="flex flex-col gap-0.5">
              <span className="font-playfair font-semibold text-[#131720] text-2xl lg:text-[30px] leading-none lg:leading-[36px]">
                40,000+
              </span>
              <span className="font-sans font-normal text-[#657186] text-[14px] leading-[20px]">
                Homes across USA
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-playfair font-semibold text-[#131720] text-2xl lg:text-[30px] leading-none lg:leading-[36px]">
                4.9 / 5
              </span>
              <span className="font-sans font-normal text-[#657186] text-[14px] leading-[20px]">
                Average review score
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-playfair font-semibold text-[#131720] text-2xl lg:text-[30px] leading-none lg:leading-[36px]">
                ±1mm
              </span>
              <span className="font-sans font-normal text-[#657186] text-[14px] leading-[20px]">
                Cutting precision
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-playfair font-semibold text-[#131720] text-2xl lg:text-[30px] leading-none lg:leading-[36px]">
                3 min
              </span>
              <span className="font-sans font-normal text-[#657186] text-[14px] leading-[20px]">
                Average install time
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
