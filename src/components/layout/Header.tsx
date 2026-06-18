"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';
import { BLACKOUT_PRODUCT_PATH, FITTING_GUIDE_PATH, MEASURING_GUIDE_PATH } from '@/lib/product-routes';

const Header = () => {
  const { cart } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href');
    if (pathname === '/' && href?.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      const elem = document.getElementById(targetId);
      if (elem) {
        e.preventDefault();
        elem.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
      }
    }
  };

  return (
    <header className="w-full flex justify-center sticky top-0 z-50 bg-black border-b border-white/8 px-4 md:px-6">
      <div className="w-full max-w-[1280px] flex items-center justify-between py-4 relative">
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-white/80 hover:bg-white/10 transition-colors duration-200"
        >
          <span className="relative w-5 h-5">
            <span
              className={`absolute left-0 top-[4px] w-5 h-[1.75px] rounded-full bg-current transition-transform duration-300 ease-out ${
                mobileMenuOpen ? 'translate-y-[6px] rotate-45' : ''
              }`}
            />
            <span
              className={`absolute left-0 top-[10px] w-5 h-[1.75px] rounded-full bg-current transition-all duration-250 ease-out ${
                mobileMenuOpen ? 'opacity-0 scale-x-50' : 'opacity-100 scale-x-100'
              }`}
            />
            <span
              className={`absolute left-0 top-[16px] w-5 h-[1.75px] rounded-full bg-current transition-transform duration-300 ease-out ${
                mobileMenuOpen ? '-translate-y-[6px] -rotate-45' : ''
              }`}
            />
          </span>
        </button>

        {/* Logo */}
        <Link href="/" className="flex flex-col items-start leading-none shrink-0" aria-label="Home">
          <span className="font-playfair text-white text-[20px] font-normal tracking-[-0.5px]">
            Lumina
          </span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-8 shrink-0">
          <Link
            href={BLACKOUT_PRODUCT_PATH}
            className="font-sans font-medium text-[14px] text-white/50 hover:text-white transition-colors leading-[20px] whitespace-nowrap"
          >
            The Blind
          </Link>
          <Link
            href={MEASURING_GUIDE_PATH}
            className="font-sans font-medium text-[14px] text-white/50 hover:text-white transition-colors leading-[20px] whitespace-nowrap"
          >
            Measuring
          </Link>
          <Link
            href={FITTING_GUIDE_PATH}
            className="font-sans font-medium text-[14px] text-white/50 hover:text-white transition-colors leading-[20px] whitespace-nowrap"
          >
            Fitting
          </Link>
          <Link
            href="/#reviews"
            onClick={handleScroll}
            className="font-sans font-medium text-[14px] text-white/50 hover:text-white transition-colors leading-[20px] whitespace-nowrap"
          >
            Reviews
          </Link>
          <Link
            href="/#faq"
            onClick={handleScroll}
            className="font-sans font-medium text-[14px] text-white/50 hover:text-white transition-colors leading-[20px] whitespace-nowrap"
          >
            FAQ
          </Link>
        </nav>

        {/* Icons (Account & Cart) */}
        <div className="flex shrink-0 items-center justify-end gap-5 text-white/80">
          <Link href="/cart" aria-label="Cart" className="hover:text-white transition-colors relative">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cart.itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-[#0a0c10] text-[10px] font-semibold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                {cart.itemCount > 99 ? '99+' : cart.itemCount}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="hover:text-white transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`absolute top-full left-0 right-0 lg:hidden z-50 origin-top transition-all duration-300 ease-out ${
            mobileMenuOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <nav className="mt-2 bg-[#0a0c10] border border-white/10 rounded-2xl shadow-[0_14px_34px_rgba(0,0,0,0.5)] py-3 px-2 overflow-hidden">
            <div className="flex flex-col">
              <Link
                href={BLACKOUT_PRODUCT_PATH}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl font-sans font-medium text-[14px] text-white/60 hover:text-white hover:bg-white/8 transition-all duration-250 ${
                  mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
                }`}
                style={{ transitionDelay: mobileMenuOpen ? '40ms' : '0ms' }}
              >
                The Blind
              </Link>
              <Link
                href={MEASURING_GUIDE_PATH}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl font-sans font-medium text-[14px] text-white/60 hover:text-white hover:bg-white/8 transition-all duration-250 ${
                  mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
                }`}
                style={{ transitionDelay: mobileMenuOpen ? '80ms' : '0ms' }}
              >
                Measuring
              </Link>
              <Link
                href={FITTING_GUIDE_PATH}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl font-sans font-medium text-[14px] text-white/60 hover:text-white hover:bg-white/8 transition-all duration-250 ${
                  mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
                }`}
                style={{ transitionDelay: mobileMenuOpen ? '120ms' : '0ms' }}
              >
                Fitting
              </Link>
              <Link
                href="/#reviews"
                onClick={(e) => {
                  handleScroll(e);
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2.5 rounded-xl font-sans font-medium text-[14px] text-white/60 hover:text-white hover:bg-white/8 transition-all duration-250 ${
                  mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
                }`}
                style={{ transitionDelay: mobileMenuOpen ? '160ms' : '0ms' }}
              >
                Reviews
              </Link>
              <Link
                href="/#faq"
                onClick={(e) => {
                  handleScroll(e);
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2.5 rounded-xl font-sans font-medium text-[14px] text-white/60 hover:text-white hover:bg-white/8 transition-all duration-250 ${
                  mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
                }`}
                style={{ transitionDelay: mobileMenuOpen ? '200ms' : '0ms' }}
              >
                FAQ
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
