"use client";

import { useCountdown } from "@/hooks/useEndOfDayCountdown";
import { SEASONAL_SALE, SEASONAL_SALE_ENDS_AT } from "@/lib/seasonal-theme";
import { getSalePhase } from "@/lib/sale-deadline";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

interface SaleCountdownProps {
  /** "hero" and "topbar" sit on dark backgrounds; "pdp" sits on white. */
  variant?: "topbar" | "pdp" | "hero";
}

export default function SaleCountdown({ variant = "pdp" }: SaleCountdownProps) {
  // Seasonal sales count down to their real end date; otherwise to the end of the day
  const { days, hours, minutes, seconds, expired, now } = useCountdown(SEASONAL_SALE_ENDS_AT);

  if (!now || expired) return null;

  const formatted = `${days > 0 ? `${days}d ` : ""}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  const phase = SEASONAL_SALE_ENDS_AT ? getSalePhase(SEASONAL_SALE_ENDS_AT, now) : "active";
  const endDate = SEASONAL_SALE_ENDS_AT
    ? SEASONAL_SALE_ENDS_AT.toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : null;
  const deadlineLabel = phase === "final-hours"
    ? "Final Hours"
    : phase === "ending-soon"
      ? "Ends Soon"
      : endDate ? `Ends ${endDate}` : "Ends in";

  if (variant === "topbar" || variant === "hero") {
    return (
      <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-sans text-[11px] font-medium text-amber-200 sm:text-[12px]">
        <span className="font-semibold">{deadlineLabel}</span>
        {phase !== "active" && endDate && <span>· Ends {endDate}</span>}
        {(!endDate || phase !== "active") && <span className="tabular-nums text-white/70">{formatted}</span>}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-amber-400" />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${SEASONAL_SALE ? "bg-amber-600" : "bg-red-600"}`} />
      </span>
      <span className={`font-sans text-[12px] font-medium ${SEASONAL_SALE ? "text-amber-800" : "text-red-600"}`}>
        {SEASONAL_SALE ? `${deadlineLabel} · ` : "Sale ends in "}
        <span className="font-semibold tabular-nums">{formatted}</span>
      </span>
    </div>
  );
}
