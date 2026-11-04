# Black Friday sale theme

The November 2026 campaign re-labels the existing offers as Black Friday offers and applies a black, white, and gold theme with sale-tag icons. It does not change discounts, prices, or codes: `FINAL15` and the 10% subscriber offer work exactly as before.

Everything is driven by `SEASONAL_SALE` in `src/lib/seasonal-theme.ts`.

## Turning it off

1. Open `src/lib/seasonal-theme.ts`.
2. Change the export to:

   ```ts
   export const SEASONAL_SALE: SeasonalSale | null = null;
   ```

3. Deploy through the site's normal deployment workflow.

This restores the regular wording and colours, removes the hero sale pill and gold glow, and returns the countdown to resetting at the visitor's midnight. To turn the campaign back on, set the constant to `BLACK_FRIDAY_SALE` again.

## The end date

`endsAt` is `2026-11-30T23:59:59`: November 30, 2026, at the end of the 11:59 PM minute in each visitor's local time. The timestamp intentionally has no UTC offset, matching the previous campaign's countdown behaviour.

Once the deadline passes, the countdown and its "Ends in" label disappear from the announcement bar and product page. The campaign wording and colours remain until `SEASONAL_SALE` is set to `null` and the change is deployed. The date does not automatically disable the theme or any Shopify discount.

## What the theme changes

| Area | File | With the theme on | With it off |
| --- | --- | --- | --- |
| Announcement bar | `src/components/layout/TopBar.tsx` | "Black Friday Sale \| Up to 60% Off…", gold border and sale-tag icon on black | "Our Biggest Sale \| Up to 60% Off…", regular black bar |
| Countdown | `src/components/common/SaleCountdown.tsx` | Counts down to `endsAt`, gold accents, "Black Friday Sale ends in" on the product page | Counts down to midnight, regular amber/red accents, "Sale ends in" |
| Homepage hero | `src/components/home/Hero.tsx` | Black Friday pill, gold button and stars, subtle gold glow | No sale pill or glow, white button, regular amber stars |
| Product page | `src/components/product/ProductInfo.tsx` | "Black Friday Sale price", gold discount badges, "Black Friday offer: extra 15% off with code", gold Buy Now buttons on the page and sticky bar | "Sale price", dark badges, "Extra 15% off with code", dark Buy Now buttons |
| Homepage popup | `src/components/home/EmailCaptureModal.tsx` | "Black Friday Offer", "Black Friday welcome offer", gold dots and button | "Limited Offer", "Exclusive welcome offer", green dots, white button |
| Subscribe section | `src/components/home/SubscribeOffer.tsx` | "A Black Friday bonus: 10% off." | "Subscribe for 10% off." |

All campaign copy and the deadline live in `BLACK_FRIDAY_SALE`. The decorative sale-tag icon is an inline SVG in `src/components/common/SaleTagIcon.tsx`.

## Removing the campaign code completely

Switching off is enough to restore the regular site. To remove the campaign code as well:

1. Set `SEASONAL_SALE` to `null`, or reuse the seasonal switch for the next campaign.
2. If removing the switch, replace the seasonal conditional branches in the files above with their regular versions, delete seasonal-only blocks, and remove the `seasonal-theme` and `SaleTagIcon` imports. Remove the theme-only helpers `ACCENT_DOT`, `SALE_BADGE`, and `BUY_NOW_COLORS`, preserving their regular values at each usage.
3. In `SaleCountdown.tsx`, call `useCountdown()` without a target (or use `useEndOfDayCountdown()`).
4. Delete `src/lib/seasonal-theme.ts`, `src/components/common/SaleTagIcon.tsx`, and this document once nothing references them.
5. Run `npx tsc --noEmit`, `npm run lint`, `npm test`, and `npm run build`.

Keep the reusable `useCountdown(target)` hook and the countdown-owned "Ends in" label: the fixed-date countdown supports future campaigns, and the label disappears with an expired timer.

## Unchanged

Shopify checkout, discount codes, pricing calculations, subscriber behaviour, emails, product photos, page metadata, and the Shopify draft theme in `shopify/`.
