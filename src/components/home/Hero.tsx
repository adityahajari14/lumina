import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative w-full bg-[#eaedf0] min-h-[90vh] flex items-center justify-center py-20 lg:py-30 lg:pt-10 overflow-hidden">
      {/* Background image & gradient overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/home/hero-img1.png" 
          alt="Minimal room with window" 
          fill 
          className="object-cover opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#eaedf0] via-[#eaedf0]/90 to-transparent lg:to-[rgba(234,237,240,0.4)]" />
      </div>

      {/* Content container */}
      <div className="relative z-10 w-full max-w-[1280px] px-6 mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-12 items-center">

        {/* Mobile Header (Hidden on Desktop) */}
        <div className="flex flex-col items-start gap-6 max-w-[576px] w-full lg:hidden order-1">
          {/* Badge: Rated 4.9 */}
          <div className="bg-[#4051b5]/10 rounded-full py-1.5 px-3 flex items-center gap-2">
            <div className="flex gap-0.5 text-[#4051b5]">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              ))}
            </div>
            <span className="text-[#4051b5] font-sans font-medium text-xs">     
              Rated 4.9 by 2,400+ customers
            </span>
          </div>

          {/* Heading */}
          <h1 className="flex flex-col font-playfair font-medium text-[#131720] text-5xl leading-tight">
            <span>Sleep in</span>
            <span className="font-normal italic">total</span>
            <span>darkness.</span>
          </h1>
        </div>

        {/* Left Column */}
        <div className="flex flex-col items-start gap-6 max-w-[576px] order-3 lg:order-1">
          {/* Badge: Rated 4.9 - Desktop */}
          <div className="hidden lg:flex bg-[#4051b5]/10 rounded-full py-1.5 px-3 items-center gap-2">
            <div className="flex gap-0.5 text-[#4051b5]">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              ))}
            </div>
            <span className="text-[#4051b5] font-sans font-medium text-xs">     
              Rated 4.9 by 2,400+ customers
            </span>
          </div>

          {/* Heading - Desktop */}
          <h1 className="hidden lg:flex flex-col font-playfair font-medium text-[#131720] text-[72px] leading-[72px]">
            <span>Sleep in</span>
            <span className="font-normal italic">total</span>
            <span>darkness.</span>
          </h1>

          {/* Description */}
          <p className="font-sans font-light text-[#657186] text-lg leading-[29.25px] max-w-[448px]">
            The Lumina blind blocks 100% of light — no gaps, no glare. Precision-made for your window, installed in minutes. No drills. No fuss.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
            <Link 
              href="/products" 
              className="bg-[#131720] text-[#f9fafb] font-sans font-medium text-sm text-center px-[32px] py-[16px] rounded-full hover:bg-black transition-colors"
            >
              Shop The Blind
            </Link>
            <Link 
              href="/measuring" 
              className="border border-[#dbe0e6] text-[#131720] font-sans font-medium text-sm text-center px-[32px] py-[16px] rounded-full hover:bg-white transition-colors"
            >
              How to Measure
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-playfair font-semibold text-[#131720] text-2xl leading-none">100%</span>
              <span className="font-sans text-[#657186] text-xs">Light Blocked</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-playfair font-semibold text-[#131720] text-2xl leading-none">12+</span>
              <span className="font-sans text-[#657186] text-xs">Size Options</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-playfair font-semibold text-[#131720] text-2xl leading-none">3 min</span>
              <span className="font-sans text-[#657186] text-xs">Avg Install Time</span>
            </div>
          </div>
        </div>

        {/* Right Column - Image */}
        <div className="relative w-full aspect-[4/5] max-w-[480px] lg:max-w-[592px] mx-auto lg:ml-auto mt-2 lg:mt-0 order-2 lg:order-2">
          <div className="relative w-full h-full rounded-[24px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(19,23,32,0.1)]">
            <Image
              src="/home/hero-img1.png"
              alt="Lumina blackout blind in bedroom"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Certified Badge Overlay */}
          <div className="absolute -bottom-4 left-4 lg:-left-6 bg-[#f9fafb] border border-[#dbe0e6] rounded-[16px] py-[17px] px-[21px] shadow-lg flex flex-col gap-0.5">
            <span className="font-sans text-[#657186] text-xs leading-none">Certified by</span>
            <span className="font-sans font-semibold text-[#131720] text-sm leading-none mt-1">OEKO-TEX® Standard 100</span>
          </div>
        </div>
        
      </div>

      {/* Explore arrow at absolute bottom */}
      <div className="absolute bottom-[32px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 hidden lg:flex">
        <span className="font-sans text-[#657186] text-[12px] uppercase tracking-[1.2px]">Explore</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#657186" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
