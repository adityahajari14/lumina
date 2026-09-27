'use client';

export default function ProductError({ reset }: { reset: () => void }) {
  return <div className="mx-auto max-w-xl px-6 py-20 text-center" role="alert">
    <h1 className="text-2xl font-semibold">We couldn’t load this product</h1>
    <p className="my-4">Product information is temporarily unavailable. Your saved cart is safe.</p>
    <button type="button" onClick={reset} className="rounded-full bg-black px-6 py-3 text-white">Try again</button>
  </div>;
}
