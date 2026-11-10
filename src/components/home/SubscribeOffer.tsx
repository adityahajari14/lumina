'use client';

import { useState } from 'react';
import type { NewsletterSubscriptionResult } from '@/types';
import { SEASONAL_SALE } from '@/lib/seasonal-theme';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

export default function SubscribeOffer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] =
    useState<NewsletterSubscriptionResult | null>(null);
  const [copiedCode, setCopiedCode] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessData(null);
    setCopiedCode('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const json =
        (await response.json()) as ApiResponse<NewsletterSubscriptionResult>;

      if (!response.ok || !json.success || !json.data) {
        throw new Error(
          json.error?.message || 'Unable to subscribe right now. Please try again.'
        );
      }

      setSuccessData(json.data);
      setEmail('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to subscribe right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => {
        setCopiedCode((current) => (current === code ? '' : current));
      }, 2000);
    } catch {
      setCopiedCode('');
    }
  };

  return (
    <section className="bg-[#000] px-6 py-16 md:py-24 w-full">
      <div className="max-w-[1280px] mx-auto">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] items-center">
            <div className="px-6 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12 border-b border-white/8 lg:border-b-0 lg:border-r border-white/8">
              <div className="max-w-[500px] flex flex-col gap-4">
                <p className="font-sans font-medium text-white/40 text-[12px] leading-4 tracking-[1.2px] uppercase">
                  Email Updates
                </p>
                <h2 className="font-playfair font-medium text-[#f9fafb] text-[36px] md:text-[48px] leading-tight md:leading-[48px]">
                  {SEASONAL_SALE ? SEASONAL_SALE.subscribeHeading : 'Subscribe for 15% off.'}
                </h2>
                <p className="font-sans text-white/58 text-[15px] leading-7 max-w-[420px]">
                  Product updates, measuring guidance, and a 15% code for your first order.
                </p>
              </div>
            </div>

            <div className="px-6 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12 bg-white/[0.02]">
              <div className="flex flex-col gap-5">
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="newsletter-email"
                      className="font-sans font-medium text-[#f9fafb] text-sm"
                    >
                      Email address
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3.5 text-[15px] text-[#131720] outline-none transition-colors placeholder:text-[#8a94a6] focus:border-[#4051b5]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-white text-[#131720] font-sans font-medium text-sm px-6 py-3.5 rounded-full transition-colors hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? 'Submitting...' : 'Subscribe'}
                  </button>
                </form>

                <p className="font-sans text-[12px] leading-5 text-white/40">
                  By subscribing, you agree to receive email updates from Lumina.
                </p>

                <div aria-live="polite" className={errorMessage || successData ? 'mt-1' : ''}>
                  {errorMessage ? (
                    <div className="rounded-2xl border border-[#5b2c2c] bg-[#2a1717] px-4 py-3">
                      <p className="font-sans text-sm leading-6 text-[#f2b8b5]">
                        {errorMessage}
                      </p>
                    </div>
                  ) : null}

                  {successData ? (
                    <div className="rounded-2xl border border-[#2f4d3c] bg-[#16231b] px-4 py-4 flex flex-col gap-3">
                      <p className="font-sans text-sm text-[#c5d8ca]">
                        {successData.message}
                      </p>
                      <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center justify-between gap-4 flex-1 min-w-0">
                          <span className="font-sans text-[11px] uppercase tracking-[1.2px] text-white/45">
                            Code
                          </span>
                          <span className="font-sans font-semibold text-[#f9fafb] text-[15px] truncate">
                            {successData.code}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(successData.code)}
                          className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 font-sans text-[12px] font-medium text-[#f9fafb] transition-colors hover:bg-white/8"
                        >
                          {copiedCode === successData.code ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
