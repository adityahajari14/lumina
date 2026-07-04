import Image from 'next/image';
import Link from 'next/link';
import SmartVideo from '../common/SmartVideo';
import GuaranteeBadges from '@/components/product/GuaranteeBadges';
import { BLACKOUT_PRODUCT_PATH, MEASURING_GUIDE_PATH } from '@/lib/product-routes';

export default function Hero() {
  return (
    <section className="relative w-full bg-[#0a0c10] min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/home/lumina-hero.webp"
          alt="Lumina blackout blind lifestyle"
          fill
          className="object-cover opacity-80"
          priority
        />
        {/* Left-to-right dark fade so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/5" />
        {/* Top & bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1280px] px-6 mx-auto grid lg:grid-cols-[1fr_auto_1fr] gap-10 lg:gap-12 items-center py-28 lg:py-36">

        {/* Left Column */}
        <div className="flex flex-col items-start gap-7">

          {/* Rating pill */}
          <div className="flex items-center gap-2.5 bg-white/8 border border-white/12 rounded-full py-2 px-4">
            <div className="flex gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="font-sans text-white/70 text-xs tracking-wide">
              4.8 · 750+ verified reviews
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-playfair font-medium text-white text-[56px] lg:text-[80px] leading-[1.0] tracking-tight">
            Sleep in<br />
            <span className="font-normal italic text-white/80">total</span><br />
            darkness.
          </h1>

          {/* Description */}
          <p className="font-sans font-light text-white/55 text-[17px] leading-relaxed max-w-[420px]">
            Wake up on your schedule, not the sun&apos;s. Lumina blocks 100% of light — no gaps, no glare. Precision-made for your window. No drills. No fuss.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Link
              href={BLACKOUT_PRODUCT_PATH}
              className="bg-white text-[#0a0c10] font-sans font-semibold text-[14px] text-center px-8 py-4 rounded-full hover:bg-white/90 transition-colors"
            >
              Shop The Blind
            </Link>
            <Link
              href={MEASURING_GUIDE_PATH}
              className="border border-white/25 text-white/80 font-sans font-medium text-[14px] text-center px-8 py-4 rounded-full hover:bg-white/8 hover:text-white transition-colors"
            >
              How to Measure
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-0 pt-3 border-t border-white/8 w-full max-w-[420px]">
            {[
              { value: '100%', label: 'Light Blocked' },
              { value: '12+', label: 'Size Options' },
              { value: '5 min', label: 'Install Time' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col gap-1 px-5 first:pl-0">
                  <span className="font-playfair font-semibold text-white text-[26px] leading-none">{stat.value}</span>
                  <span className="font-sans text-white/40 text-[11px] uppercase tracking-wider">{stat.label}</span>
                </div>
                {i < 2 && <div className="w-px h-8 bg-white/10" />}
              </div>
            ))}
          </div>

          {/* Free shipping note */}
          <div className="flex items-center gap-2 text-white/35 -mt-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span className="font-sans text-[12px] tracking-wide">Free shipping across the USA on every order</span>
          </div>

          {/* Guarantee stamps (small screens) */}
          <div className="lg:hidden">
            <GuaranteeBadges variant="light" size={72} layout="row" />
          </div>
        </div>

        {/* Middle Column - Guarantee stamps (large screens) */}
        <div className="hidden lg:flex">
          <GuaranteeBadges variant="light" size={96} layout="stack" />
        </div>

        {/* Right Column - Video */}
        <div className="relative w-full aspect-square max-w-[520px] mx-auto lg:ml-auto">
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,0,0,0.8)] ring-1 ring-white/8">
            <SmartVideo
              src="/home/blackout-hero.webm"
              posterSrc="/product/gallery-1.webp"
              posterAlt="Blackout blind over a bedroom window"
              eager
              preload="metadata"
              priorityPoster
            />
          </div>

          {/* OEKO-TEX badge */}
          <div className="absolute -bottom-5 left-4 lg:-left-6 bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl py-4 px-5 shadow-xl flex items-center gap-3">
            <div className="bg-white/10 rounded-xl w-9 h-9 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-sans text-white/50 text-[10px] uppercase tracking-widest leading-none">Certified by</span>
              <span className="font-sans font-semibold text-white text-[13px] leading-none mt-1">OEKO-TEX® Standard 100</span>
            </div>
          </div>
        </div>

      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 z-10">
        <span className="font-sans text-white/30 text-[10px] uppercase tracking-[2px]">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  );
}
