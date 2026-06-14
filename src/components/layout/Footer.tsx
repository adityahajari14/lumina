"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BLACKOUT_PRODUCT_PATH, FITTING_GUIDE_PATH, MEASURING_GUIDE_PATH } from '@/lib/product-routes';

const Footer = () => {
  const pathname = usePathname();

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

  const navItems = [
    { label: 'The Blind', href: BLACKOUT_PRODUCT_PATH },
    { label: 'Measuring', href: MEASURING_GUIDE_PATH },
    { label: 'Fitting', href: FITTING_GUIDE_PATH },
    { label: 'Reviews', href: '/#reviews' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <footer className="bg-[#000] flex flex-col items-center w-full mt-auto">
      {/* Top CTA Section */}
      <div className="w-full border-b border-white/10 flex flex-col items-center pt-20 pb-10 px-6">
        <h2 className="font-playfair text-[#f9fafb] text-[48px] leading-none text-center flex flex-col sm:flex-row sm:gap-2 mb-4">
          <span className="font-medium">Ready to sleep in</span>
          <span className="font-normal italic">total darkness?</span>
        </h2>
        
        <p className="font-sans text-[14px] leading-[20px] text-white/60 text-center max-w-[384px] mb-8">
          Join 750+ customers who trust Lumina 
          <br className="hidden sm:block" />
          for the perfect night&apos;s sleep.
        </p>

        <Link 
          href={BLACKOUT_PRODUCT_PATH}
          className="bg-white text-[#131720] font-sans font-medium text-[14px] leading-[20px] px-8 py-4 rounded-full hover:bg-gray-100 transition-colors"
        >
          Shop The Blind &rarr;
        </Link>

        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <span className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
            Manufactured in
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-[12px] leading-[18px] text-white/65">
            <span>Texas, USA</span>
            <span className="text-white/25" aria-hidden="true">
              &middot;
            </span>
            <span>Leeds, UK</span>
            <span className="text-white/25" aria-hidden="true">
              &middot;
            </span>
            <span>Guangzhou, China</span>
          </div>
        </div>
      </div>

      {/* Middle Navigation Section */}
      <div className="w-full max-w-[1280px] flex flex-col sm:flex-row items-center justify-between py-10 px-6 gap-8">
        {/* Logo */}
        <div className="flex shrink-0">
          <Link href="/" className="font-playfair font-medium text-[#f9fafb] text-[20px] leading-[28px]">
            Lumina
          </Link>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.label}
              href={item.href}
              onClick={handleScroll}
              className="font-sans text-[14px] leading-[20px] text-white/60 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Social Icons */}
        <div className="flex items-center gap-4 shrink-0">
          <a href="https://www.instagram.com/luminablackoutblinds/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 hover:text-white transition-colors">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="https://www.facebook.com/profile.php?id=61568979181893" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 hover:text-white transition-colors">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="w-full border-t border-white/10 py-5 px-6 flex flex-col items-center gap-2">
        <div className="flex items-center gap-4 text-[12px] leading-4">
          <Link
            href="/privacy-policy"
            className="font-sans text-white/50 hover:text-white transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-white/25">|</span>
          <Link
            href="/terms-of-service"
            className="font-sans text-white/50 hover:text-white transition-colors"
          >
            Terms of Service
          </Link>
          <span className="text-white/25">|</span>
          <Link
            href="/shipping-policy"
            className="font-sans text-white/50 hover:text-white transition-colors"
          >
            Shipping Policy
          </Link>
          <span className="text-white/25">|</span>
          <Link
            href="/returns-refunds-policy"
            className="font-sans text-white/50 hover:text-white transition-colors"
          >
            Returns &amp; Refunds
          </Link>
        </div>
        <p className="font-sans text-[12px] leading-[16px] text-white/40 text-center">
          &copy; 2026 Lumina. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
