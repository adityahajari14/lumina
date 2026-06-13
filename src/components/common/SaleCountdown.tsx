"use client";

import { useEndOfDayCountdown } from "@/hooks/useEndOfDayCountdown";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

interface SaleCountdownProps {
  /** "topbar" renders inline white text; "pdp" renders a coloured badge */
  variant?: "topbar" | "pdp";
}

export default function SaleCountdown({ variant = "pdp" }: SaleCountdownProps) {
  const { hours, minutes, seconds } = useEndOfDayCountdown();

  const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  if (variant === "topbar") {
    return (
      <span className="font-sans font-semibold text-[11px] sm:text-[12px] tabular-nums text-amber-300">
        {formatted}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
      </span>
      <span className="font-sans text-[12px] font-medium text-red-600">
        Sale ends in{" "}
        <span className="font-semibold tabular-nums">{formatted}</span>
      </span>
    </div>
  );
}
