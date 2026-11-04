export interface SeasonalSale {
  /** Replaces "Sale" / "Our Biggest Sale" wherever the offer is named */
  saleName: string;
  /** Short pill label used on the homepage popup */
  offerLabel: string;
  /** Hero pill text */
  heroPill: string;
  /** Prefix for the PDP promo code row */
  promoCodeLabel: string;
  /** Eyebrow above the popup's 10% welcome offer */
  welcomeEyebrow: string;
  /** Heading of the homepage subscribe section */
  subscribeHeading: string;
  /** Countdown target, in the visitor's local time. The countdown hides once it passes. */
  endsAt: string;
}

const BLACK_FRIDAY_SALE: SeasonalSale = {
  saleName: "Black Friday Sale",
  offerLabel: "Black Friday Offer",
  heroPill: "Black Friday Sale · Up to 60% off",
  promoCodeLabel: "Black Friday offer: extra 15% off with code",
  welcomeEyebrow: "Black Friday welcome offer",
  subscribeHeading: "A Black Friday bonus: 10% off.",
  endsAt: "2026-11-30T23:59:59",
};

/**
 * Temporary festive theme. Discounts and codes are unchanged — this only
 * re-labels and re-skins the existing offers.
 *
 * To switch the site back to its regular look, set this to `null`.
 */
export const SEASONAL_SALE: SeasonalSale | null = BLACK_FRIDAY_SALE;

// Keep the null check in a function so setting the switch to null also type-checks.
function getSaleEndDate(sale: SeasonalSale | null): Date | null {
  return sale ? new Date(sale.endsAt) : null;
}

export const SEASONAL_SALE_ENDS_AT: Date | null = getSaleEndDate(SEASONAL_SALE);
