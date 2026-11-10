# Black Friday sale theme

The November 2026 campaign re-labels the existing offers as Black Friday offers and applies a black, white, and gold theme with sale-tag icons. It does not change the `FINAL15` offer. The email signup offer is now 15% off with code `SUBSCRIBE15`, and the Split opening direction surcharge is $75.

Everything is driven by `SEASONAL_SALE` in `src/lib/seasonal-theme.ts`.

## Turning it off

1. Open `src/lib/seasonal-theme.ts`.
2. Change the export to:

   ```ts
   export const SEASONAL_SALE: SeasonalSale | null = null;
   ```

3. Deploy through the site's normal deployment workflow.

This restores the regular wording and colours, removes the hero offer block and gold glow, and returns the countdown to resetting at the visitor's midnight. To turn the campaign back on, set the constant to `BLACK_FRIDAY_SALE` again.

## The end date

`endsAt` is `2026-11-30T23:59:59`: November 30, 2026, at the end of the 11:59 PM minute in each visitor's local time. The timestamp intentionally has no UTC offset, matching the previous campaign's countdown behaviour.

Once the deadline passes, deadline messages and countdowns disappear from the announcement bar, hero, and product offer. The campaign wording and colours remain until `SEASONAL_SALE` is set to `null` and the change is deployed. The date does not automatically disable the theme or any Shopify discount.

Before the final three days, the announcement bar, hero offer, and product offer show "Ends November 30". On November 28 and 29, this changes to "Ends Soon" with the fixed-date countdown. On November 30, it changes to "Final Hours". These transitions follow the visitor's local calendar, hide after the deadline, and do not appear briefly before hydration. The date logic lives in `src/lib/sale-deadline.ts`.

## What the theme changes

| Area | File | With the theme on | With it off |
| --- | --- | --- | --- |
| Announcement bar | `src/components/layout/TopBar.tsx` | "Black Friday: Up to 60% off + extra 15%", gold code-copy button and deadline on black | "Our Biggest Sale \| Up to 60% Off…", regular black bar |
| Deadline / countdown | `src/components/common/SaleCountdown.tsx` | Fixed deadline, "Ends Soon" and "Final Hours" only near the end, gold accents | Counts down to midnight, regular amber/red accents, "Sale ends in" |
| Homepage hero | `src/components/home/Hero.tsx` | "Better sleep. Black Friday prices.", prominent savings and code block, "Shop Black Friday", shipping and guarantee reassurance, subtle gold glow | Regular sleep headline, no offer block or glow, white button, regular amber stars |
| Product page | `src/components/product/ProductInfo.tsx` | Savings, extra 15% code, and deadline together beside the price; shipping and guarantee reassurance by purchase buttons; gold badges and Buy Now buttons | Regular price and promo wording, dark badges and Buy Now buttons |
| Homepage popup | `src/components/home/EmailCaptureModal.tsx` | "Black Friday Offer", "Black Friday welcome offer", gold dots and button | "Limited Offer", "Exclusive welcome offer", green dots, white button |
| Subscribe section | `src/components/home/SubscribeOffer.tsx` | "A Black Friday bonus: 15% off." | "Subscribe for 15% off." |

All campaign copy and the deadline live in `BLACK_FRIDAY_SALE`. The decorative sale-tag icon is an inline SVG in `src/components/common/SaleTagIcon.tsx`.

## Removing the campaign code completely

Switching off is enough to restore the regular site. To remove the campaign code as well:

1. Set `SEASONAL_SALE` to `null`, or reuse the seasonal switch for the next campaign.
2. If removing the switch, replace the seasonal conditional branches in the files above with their regular versions, delete seasonal-only blocks, and remove the `seasonal-theme` and `SaleTagIcon` imports. Remove the theme-only helpers `ACCENT_DOT`, `SALE_BADGE`, and `BUY_NOW_COLORS`, preserving their regular values at each usage.
3. In `SaleCountdown.tsx`, call `useCountdown()` without a target (or use `useEndOfDayCountdown()`).
4. Delete `src/lib/seasonal-theme.ts`, `src/lib/sale-deadline.ts`, `src/components/common/SaleTagIcon.tsx`, `tests/sale-deadline.test.cjs`, and this document once nothing references them.
5. Run `npx tsc --noEmit`, `npm run lint`, `npm test`, and `npm run build`.

Keep the reusable `useCountdown(target)` hook and the countdown-owned "Ends in" label: the fixed-date countdown supports future campaigns, and the label disappears with an expired timer.

## Unchanged

Shopify checkout, discount codes, pricing calculations, the 15% email signup popup and subscribe section, subscriber behaviour, emails, product photos, page metadata, and the Shopify draft theme in `shopify/`.
