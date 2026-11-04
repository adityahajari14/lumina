"use client";

import { useCountdown } from "@/hooks/useEndOfDayCountdown";
import { SEASONAL_SALE, SEASONAL_SALE_ENDS_AT } from "@/lib/seasonal-theme";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

interface SaleCountdownProps {
  /** "topbar" renders inline white text; "pdp" renders a coloured badge */
  variant?: "topbar" | "pdp";
}

export default function SaleCountdown({ variant = "pdp" }: SaleCountdownProps) {
  // Seasonal sales count down to their real end date; otherwise to the end of the day
  const { days, hours, minutes, seconds, expired } = useCountdown(SEASONAL_SALE_ENDS_AT);

  if (expired) return null;

  const formatted = `${days > 0 ? `${days}d ` : ""}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  if (variant === "topbar") {
    return (
      <>
        <span>| Ends in</span>
        <span className="font-sans font-semibold text-[11px] sm:text-[12px] tabular-nums text-amber-300">
          {formatted}
        </span>
      </>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-amber-400" />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${SEASONAL_SALE ? "bg-amber-600" : "bg-red-600"}`} />
      </span>
      <span className={`font-sans text-[12px] font-medium ${SEASONAL_SALE ? "text-amber-800" : "text-red-600"}`}>
        {SEASONAL_SALE ? SEASONAL_SALE.saleName : "Sale"} ends in{" "}
        <span className="font-semibold tabular-nums">{formatted}</span>
      </span>
    </div>
  );
}
