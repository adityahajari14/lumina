"use client";

import { useEffect, useState } from "react";
import type { NewsletterSubscriptionResult } from "@/types";

const STORAGE_KEY = "lumina_email_modal_seen";
const DELAY_MS = 3000;

const QUIZ_OPTIONS = [
  { id: "light", label: "Too much light in the morning" },
  { id: "noise", label: "Street noise waking me up" },
  { id: "temperature", label: "Room gets too hot or cold" },
  { id: "shift", label: "I work shifts or odd hours" },
];

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

export default function EmailCaptureModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<"quiz" | "email" | "success">("quiz");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<NewsletterSubscriptionResult | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const id = window.setTimeout(() => setVisible(true), DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  const handleQuizContinue = () => {
    if (!selectedAnswer) return;
    setStep("email");
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
      setStep("success");
      localStorage.setItem(STORAGE_KEY, "1");
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Get 10% off your first order"
    >
      <div className="relative w-full max-w-[480px] bg-[#0d0f14] rounded-[24px] overflow-hidden shadow-2xl">
        {/* Close */}
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-5 right-5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/30 transition-colors hover:border-white/20 hover:text-white/60"
          aria-label="Close"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="px-8 pt-10 pb-9">
          {/* Offer badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
              Exclusive welcome offer — 10% off
            </span>
          </div>

          {step === "quiz" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="font-playfair text-[28px] font-medium leading-tight text-white">
                  What&apos;s keeping you up at night?
                </h2>
                <p className="font-sans text-[13px] text-white/40 leading-5">
                  Tell us your biggest sleep disruptor and unlock 10% off your first order.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {QUIZ_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedAnswer(opt.id)}
                    className={`w-full text-left rounded-xl border px-4 py-3.5 font-sans text-[14px] transition-all ${
                      selectedAnswer === opt.id
                        ? "border-white/40 bg-white/10 text-white"
                        : "border-white/8 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white/80"
                    }`}
                  >
                    <span className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border mr-3 align-middle transition-colors ${selectedAnswer === opt.id ? "border-emerald-400 bg-emerald-400/20" : "border-white/20"}`}>
                      {selectedAnswer === opt.id && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      )}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleQuizContinue}
                disabled={!selectedAnswer}
                className="w-full rounded-xl bg-white py-3.5 font-sans text-[14px] font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Claim My 10% Off →
              </button>

              <p className="font-sans text-[11px] text-white/25 -mt-2">
                No purchase required. Unsubscribe anytime.
              </p>
            </div>
          )}

          {step === "email" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-end gap-2 mb-1">
                  <span className="font-playfair text-[56px] font-medium leading-none text-white">10%</span>
                  <span className="font-playfair text-[28px] font-medium leading-none text-white/50 pb-2">off</span>
                </div>
                <p className="font-sans text-[13px] text-white/50">
                  Enter your email and we&apos;ll send your personal discount code instantly.
                </p>
              </div>

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
                  {isSubmitting ? "Submitting…" : "Get My Code"}
                </button>
              </form>

              {errorMessage && (
                <p className="font-sans text-[12px] text-red-400 -mt-3">{errorMessage}</p>
              )}

              <p className="font-sans text-[11px] text-white/30 -mt-3">
                By continuing you agree to receive email updates. Unsubscribe anytime.
              </p>
            </div>
          )}

          {step === "success" && successData && (
            <div className="flex flex-col gap-7">
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
