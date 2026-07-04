"use client";

import { useEffect, useState } from "react";
import type { NewsletterSubscriptionResult } from "@/types";
import GuaranteeBadges from "@/components/product/GuaranteeBadges";

const DELAY_MS = 3000;

const BENEFITS = [
  {
    title: "100% Blackout",
    description: "Triple-layer fabric — complete darkness, noon or midnight.",
  },
  {
    title: "No-Drill Install",
    description: "Spring tension mount. Fits in seconds, leaves no marks.",
  },
  {
    title: "Made to Your Exact Size",
    description: "Enter your dimensions and every blind is cut to fit.",
  },
  {
    title: "Energy Efficient",
    description: "Honeycomb insulation — cooler summers, warmer winters.",
  },
];

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

export default function EmailCaptureModal() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<NewsletterSubscriptionResult | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  const dismiss = () => {
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json()) as ApiResponse<NewsletterSubscriptionResult>;
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error?.message || "Unable to subscribe right now. Please try again.");
      }
      setSuccessData(json.data);
      setEmail("");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to subscribe right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Get 10% off your first order">

      {/* Left panel: image */}
      <div className="relative hidden md:block md:w-[55%]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/product/gallery-1.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-linear-to-r from-black/60 to-black/30" />

        <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
          <span className="font-sans text-[20px] font-semibold tracking-[0.25em] uppercase text-white/80">
            Lumina
          </span>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">Limited Offer</span>
              </div>
              <h2 className="font-playfair text-[40px] font-medium leading-[1.1] text-white">
                Sleep better.<br />
                <span className="italic opacity-60">Starting tonight.</span>
              </h2>
              <p className="font-sans text-[13px] leading-6 text-white/40 max-w-xs">
                Join thousands who transformed their sleep with Lumina blackout blinds.
              </p>
            </div>

            <GuaranteeBadges variant="light" size={80} layout="row" />

            <div className="h-px bg-white/10" />

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex items-start gap-2.5">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <div>
                    <p className="font-sans text-[12px] font-semibold text-white/80 leading-5">{b.title}</p>
                    <p className="font-sans text-[11px] text-white/35 leading-4 mt-0.5">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex w-full md:w-[45%] flex-col bg-black">
        <div className="flex justify-end p-6">
          <button
            type="button"
            onClick={dismiss}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/30 transition-colors hover:border-white/20 hover:text-white/60"
            aria-label="Close"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center px-10 pb-14 pt-0 lg:px-14">
          {!successData ? (
            <div className="flex flex-col gap-8 max-w-90">

              <div className="flex flex-col gap-1">
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  Exclusive welcome offer
                </p>
                <div className="flex items-end gap-3 mt-1">
                  <span className="font-playfair text-[64px] font-medium leading-none text-white">10%</span>
                  <span className="font-playfair text-[32px] font-medium leading-none text-white/60 pb-2">off</span>
                </div>
                <p className="font-sans text-[13px] text-white/70 mt-1">your first order</p>
              </div>

              <div className="h-px bg-white/10" />

              <p className="font-sans text-[14px] leading-6 text-white/70">
                Enter your email and we&apos;ll send your personal discount code instantly.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-[14px] text-white outline-none placeholder:text-white/20 focus:border-white/25 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-white py-3.5 font-sans text-[14px] font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting…" : "Claim My 10% Off"}
                </button>
              </form>

              {errorMessage && (
                <p className="font-sans text-[12px] text-red-400 -mt-4">{errorMessage}</p>
              )}

              <p className="font-sans text-[11px] text-white/40 -mt-4">
                By continuing you agree to receive email updates. Unsubscribe anytime.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-7 max-w-90">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="font-playfair text-[32px] font-medium text-white leading-tight">
                  Your code is ready
                </h2>
                <p className="font-sans text-[13px] text-white/40">
                  {successData.message}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4">
                <span className="font-mono text-[22px] font-bold tracking-widest text-white">
                  {successData.code}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(successData.code)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 font-sans text-[12px] font-medium transition-all ${
                    copiedCode
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
                  }`}
                >
                  {copiedCode ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      Copied
                    </>
                  ) : "Copy"}
                </button>
              </div>

              <button
                type="button"
                onClick={dismiss}
                className="font-sans text-[13px] text-white/25 hover:text-white/50 transition-colors text-left"
              >
                Continue shopping →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
