export type SalePhase = "active" | "ending-soon" | "final-hours" | "expired";

/** Urgency follows the visitor's local calendar, rather than rolling 24-hour periods. */
export function getSalePhase(endsAt: Date, now: Date): SalePhase {
  if (now.getTime() >= endsAt.getTime()) return "expired";

  const finalDay = new Date(endsAt.getFullYear(), endsAt.getMonth(), endsAt.getDate());
  if (now >= finalDay) return "final-hours";

  const finalThreeDays = new Date(finalDay);
  finalThreeDays.setDate(finalThreeDays.getDate() - 2);
  return now >= finalThreeDays ? "ending-soon" : "active";
}
