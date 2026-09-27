**Lumina website, conversion, and Meta tracking audit — 24 September 2026**

The website has a usable commerce foundation, but it is not ready to be described as fully verified for Meta purchase optimization. Prioritize purchase measurement, measurement accuracy, consistent promises, and the mobile configuration journey before expanding ad spend. The issues below are opportunities and verified defects; their revenue impact has not been measured.

**Scope and evidence**

Reviewed the Next.js App Router structure, homepage and product components, cart, pricing, checkout service, Shopify integration, event collection, abandoned-cart reporting, subscription flow, account integration, policies, and deployment configuration. Inspected the live homepage and product page in isolated Chrome at 390 × 844 and 1440 × 844. Checked public pricing and guide endpoints and inspected analytics requests. Installed Next.js is 16.0.8; its README and Next.js 16 documentation were consulted.

The browser reproduced lost campaign attribution, unit-switching behavior, the popup, review discrepancies, and mobile layout friction. A 30 × 40 inch white blind with white frame and left-to-right opening validated at $205.71 and entered the cart. For the cart and checkout-error tests, browser analytics sends were intercepted and checkout creation was replaced with a simulated failure. No draft order, payment, email signup, or review was submitted. Normal page visits did generate ordinary analytics traffic.

There was no access to Meta Ads Manager, Events Manager, Shopify channel settings, actual orders, production logs, or Clarity recordings. Production may differ from the local checkout backend. A real purchase, payment methods, discount redemption, and ad attribution remain unverified. Browser emulation is not a real iPhone or Meta in-app browser test.

**Priority order**

| Priority | Action | Reason | Completion evidence |
|---|---|---|---|
| P0 | Verify the complete paid-order-to-Meta path | Ad optimization needs reliable purchase signals | An authorized test order appears once in Meta with the correct value, currency, and matching identity |
| P0 | Fix measurement conversion and contradictory guidance | Wrong dimensions cause hesitation, wrong orders, and support costs | Switching units preserves physical size; all instructions agree with manufacturing requirements |
| P0 | Align returns, trial, fit, and shipping promises | Shoppers currently see incompatible commitments | Product, badges, guide, cart, and policies state the same actual offer |
| P1 | Repair attribution and abandoned-cart reporting | Current reports miss or misclassify key journeys | Homepage UTM survives navigation; drawer-only carts are recorded; paid and abandoned states reconcile |
| P1 | Simplify mobile product configuration and the offer | Key buying information sits below a large gallery and repeated promotions | Test a shorter path to configuration against paid purchase conversion |
| P1 | Add checkout reliability and purchase monitoring | Failures currently have weak recovery and reporting | Alerts, retry handling, correct order IDs, and truthful event names |
| P2 | Improve performance, accessibility, and organic discovery | Supports conversion and longer-term acquisition | Field performance and targeted accessibility checks; indexable canonical product pages |

**Analytics: what is and is not working**

| System | Finding | Confidence |
|---|---|---|
| Meta Pixel | SDK and configuration for pixel `963077733004633` load. Code defines PageView, ViewContent, AddToCart, and InitiateCheckout. Instrumented cart tests captured correct configured value and USD. | Installation and calls verified; receipt and attribution in Meta unverified. No successful Meta `/tr` request was captured in this headless run, so SDK initialization alone is not treated as proof of delivery. |
| Meta Purchase / Conversions API | No Purchase sender or CAPI integration found in this repository. Paid-order webhook only logs the payload. | Confirmed for this code. Shopify or another external integration may send purchases; inspect it before adding another sender. |
| Shopify analytics | Live requests to `orders.luminablackoutblinds.com/.well-known/shopify/monorail/unstable/produce_batch` returned 200. | Transport observed; dashboard accuracy and purchase continuity unverified. |
| Microsoft Clarity | SDK loaded and collection requests returned 204. | Collection transport observed; recording usability, masking, and account configuration unverified. |
| Custom storefront analytics | Live product-view requests returned 200, but attribution and cart coverage have defects. | Confirmed code and browser evidence. |
| GA4 / Google tags | No implementation found in code or inspected browser scripts. | An analysis capability gap, not a prerequisite for Meta ads. Add GA4 if it will support a maintained purchase funnel and reporting process. |

1. **Purchase measurement is the first dependency.** In `src/lib/meta-pixel.ts`, events stop at InitiateCheckout. `src/app/api/webhooks/shopify/orders-paid/route.ts` logs an order and returns success. There is no durable purchase write or ad-platform send there. Check whether Shopify's Facebook & Instagram channel handles this exact draft-order invoice flow and uses the same pixel. Do not assume that a working Shopify Online Store integration automatically proves coverage of this custom Next.js storefront.

   Choose a clear owner for each event. If both browser and server report a purchase, coordinate the event name and identifier for deduplication. Send the actual completed-order value and currency, not the starting product price or pre-discount cart estimate. Persist order identity and relevant consented matching context, handle retries, and avoid duplicate conversion senders. Shopify explicitly warns that multiple pixel integrations can produce duplicate or incorrect reports: [Shopify Meta pixel guidance](https://help.shopify.com/en/manual/promoting-marketing/analyze-marketing/meta-pixel).

2. **Homepage campaign attribution is lost before the first custom event.** `src/lib/store-events.ts:45` captures attribution only when a product/cart/checkout event occurs. The homepage does not invoke it. In the live browser, visiting the homepage with `utm_source=meta`, `utm_medium=paid_social`, and an audit campaign, then clicking Shop The Blind, stored all three fields as null. Capture landing attribution immediately and preserve it through navigation and checkout. This proves a defect in custom reporting; it does not by itself prove Meta attribution is lost.

3. **The custom “session” never expires.** Session ID, start time, and attribution are stored in localStorage without a session expiry. Return visits inherit old campaigns and can acquire very long durations. Separate persistent visitor identity from visit/session identity and define first-touch and current-session attribution explicitly. Add ad/ad-set identifiers and `utm_content` for creative analysis; preserve consented Meta click/browser identifiers for a server purchase integration.

4. **Most drawer-only abandoned carts are missed.** `trackStoreAddToCart` sends product/configuration fields but no `meta.items`. `src/app/api/track/route.ts` only upserts abandoned carts when `meta.items` exists. `CartDrawer.tsx` never sends cart_view; only the full `/cart` page does. Thus adding an item, seeing the drawer, and leaving does not create the intended abandoned-cart snapshot. Send a complete cart snapshot after meaningful cart changes and track drawer opens. A conversion dashboard should distinguish cart snapshots from event counts.

5. **Checkout attempts are presented as checkout progress.** InitiateCheckout and Clarity's ReachedCheckout fire before checkout creation succeeds. The instrumented 503 test reproduced this. Capture `checkout_attempt`, `checkout_created`, and `checkout_error` separately; define Meta InitiateCheckout consistently for the milestone you intend to optimize. `markAbandonedCartCheckoutStarted` marks carts `converted` on a click, even before a successful redirect. Label that state as checkout started; reserve purchase conversion for paid orders.

6. **Order status reconciliation has an ID-format defect.** `src/lib/server/order.service.ts:435` returns the GraphQL draft ID, such as `gid://shopify/DraftOrder/123`. At line 452 that whole value is interpolated into a REST URL expecting the numeric draft-order ID. This produces a malformed resource path and affects both cart clearing and abandoned-checkout reconciliation. Use GraphQL consistently or explicitly normalize the REST ID. This is code-confirmed; no real order was used to test the production endpoint. See [Shopify DraftOrder endpoint documentation](https://shopify.dev/docs/api/admin-rest/latest/resources/draftorder).

7. **Late purchases can remain labeled abandoned.** The cron runs daily, while abandonment is defined as 60 minutes. Reconciliation only selects pending rows; once marked abandoned, a later payment is not revisited. The paid webhook does not correct that state. Polling errors can also lead to abandonment classification. Use verified order webhooks to update state, retain an unknown/error state when status cannot be fetched, and reconcile late payments. Refund and cancellation handlers also only log, so the custom converted subtotal is not net sales.

8. **Identity and consent need a coherent implementation.** Shopify's analytics cart ID is a locally generated UUID formatted as a Shopify Cart GID; it is not the actual checkout cart. Browser event product IDs are slugs, so compare them with actual Meta catalog IDs before relying on catalog retargeting. Shopify analytics consent defaults to true from an environment variable, marketingAllowed is always false, and Meta/Clarity load independently of a visitor preference. Connect all relevant integrations to actual privacy choices and test allowed/denied behavior. [Shopify analytics payload documentation](https://shopify.dev/docs/api/hydrogen-react/latest/utilities/sendshopifyanalytics) describes the expected identifiers and consent fields; [Clarity consent documentation](https://learn.microsoft.com/en-us/clarity/setup-and-installation/consent-mode) describes its consent integration.

**Sales and user experience findings**

9. **Fix the physical sizing bug immediately.** In `ProductInfo.tsx:324`, switching units changes labels but preserves width, height, and fraction state. The live test changed 30 × 40 inches into 30 × 40 centimeters. Convert the physical dimensions with deliberate precision handling, or clear the fields with a clear message. Also fix rounded metric limits: the UI advertises 25 cm as a minimum even though 10 inches is 25.4 cm, and rounds maximums upward beyond valid sizes.

10. **Publish one authoritative measuring instruction.** `MeasuringGuide.tsx:68` says to use the smaller drop and subtract 3 mm; `blackout-product.ts:76` says to use the largest drop. The copy says measurements are entered at checkout although they are required before adding to cart. The FAQ describes different size limits from the live configurator, whose observed ranges were width 10–138 inches and height 10–79 inches. Confirm manufacturing rules before changing the wording. Place a short illustrated guide next to the fields, show window compatibility early, and offer a clear photo-based fit check. The existing full guide is a standalone image and the fitting guide is a PDF; both returned HTTP 200 on direct requests. Some framework prefetch requests returned 404, which is not evidence that the actual downloads are broken.

11. **Resolve the returns contradiction.** Badges promise free returns and a 30-night home trial. The product Guarantees section explicitly includes made-to-measure items in that trial. Its How to measure and Shipping & Returns sections say correctly made-to-measure items cannot be returned. The policy page focuses on faulty/damaged goods. Establish the real commercial policy, including measurement mistakes and return shipping, then reuse that content everywhere. The strongest useful reassurance is an understandable promise that operations can honor.

12. **Remove competing offers from the first mobile experience.** The full-screen welcome modal opens after three seconds and offers 10%, while the top bar advertises FINAL15 for 15%. Its close button is small and low contrast. Test a delayed, less intrusive offer after engagement, or a useful “save my measurements/quote” interaction. Do not judge this test by email signups alone: judge purchases and contribution per visitor. The server currently returns the shared SUBSCRIBE10 code and updates Shopify marketing consent; it does not send an email itself. Verify any external welcome automation before promising an instantly emailed personal code.

13. **Make pricing honest and easier to understand.** The initial product price was $148.57, but it is displayed as “Sale price,” not “From.” The configured sample became $205.71. Show “From” until a valid size is entered, then show the configured price. Clarify how FINAL15 applies, whether discounts combine, and tax treatment. The code copies a code but does not apply it to the checkout request. Verify redemption in Shopify before changing the frontend to show a guaranteed discounted total.

   `getComparePriceData` mathematically generates a 60% discount comparison from any selling price rather than reading a genuine compare-at price. The sale countdown resets every local midnight. Replace these with substantiated reference prices and actual campaign dates. These patterns can undermine trust with returning visitors.

14. **Bring the mobile buying decision above the long configuration page.** At 390 × 844, the large gallery and promotion/header occupied the first view; the product title started around y=774 and the first width input around y=1512. The sticky Buy Now button was visible before required options were chosen. Test a compact gallery, title, three benefits, honest starting price, and a primary “Choose my size” button that leads into configuration. Change the sticky label to match the stage. Keep the existing useful cart drawer and inline validation.

   A useful sequence is window compatibility → width/height → colors/opening → configuration summary → purchase. Display guide help inline, preserve unfinished configurations, and keep a readable summary in the drawer. The sampled drawer truncated the configuration to one line and used the same graphite product image even for white selections. Show all critical dimensions and options before handing off to checkout. A saveable quote or email measuring guide can help visitors who arrive from an ad without a tape measure.

15. **Use consistent, verifiable proof.** The live review module and product rating showed 115 reviews at 4.8, while the hero and product reassurance claimed 750+. These may refer to different populations, but the site does not explain that distinction. Bind counts to the intended verified data source or label them accurately. Move a small number of relevant customer photos and testimonials near the configurator. Substantiate certifications, manufacturing location, blackout claims, and numerical claims before highlighting them in ads.

16. **Calculate delivery dates from the actual promise.** The product calculates today +7 and +11 calendar days; the policy promises 7–11 business days. In the live check, it displayed October 1–5 for a September 24 visit. Use the production/shipping calendar and relevant holidays, and share the same calculation across product and cart.

**Architecture and reliability**

The core flow is Next.js/React → local browser cart → server price validation → Shopify Admin GraphQL draft order → Shopify invoice checkout. Shopify provides catalog data; local JSON supplies price bands; Judge.me supplies reviews; Neon stores custom events and abandonment records. Customer account access is handled separately through Shopify authentication. This architecture can support the business without a framework rewrite, but the custom checkout/reporting bridge needs hardening.

Positive foundations include server-side price recalculation, local cart persistence, configurable sizes, inline errors, a responsive drawer, hosted Shopify payment handling, server-rendered product content, lazy media behavior, and existing analytics hooks. The normal sample price-validation endpoint returned 200.

| Area | Finding and recommended change |
|---|---|
| Pricing failures | PricingLoaded is set true even after pricing fetch fails; validation failures can still add a fallback price. Later checkout can reject a mismatch. Show an explicit pricing error/retry and require a valid quote before purchase. |
| Server validation | Checkout checks positive dimensions but does not enforce manufacturing min/max; pricing helpers fall back to the largest band above range. Enforce valid sizes, allowed options, finite values, and integer quantity server-side. |
| API resilience | Add request deadlines, bounded retries for appropriate reads, checkout idempotency/reuse, and observable failures. A failed variant lookup is cached as null indefinitely in-process and can switch orders to custom line items. |
| Webhooks | Paid/refund/cancel handlers lack signature verification and durable processing. Authenticate the raw payload before using these handlers to update orders or send purchase conversions; add deduplication and retry-safe persistence. |
| Product fallback | Shopify failure can render a fallback product priced at zero. Render an honest unavailable/retry state rather than a plausible purchasable fallback. |
| Reviews | Every initial review fetch pages through all published shop reviews with no-store and filters afterward. Product rendering awaits it; the homepage is also force-dynamic. Cache and bound review retrieval and isolate its failure from the buying experience. |
| Images | Global `images.unoptimized: true` bypasses Next.js image optimization. Many Shopify assets could benefit from sized delivery and responsive formats. Restore optimization or use a deliberate CDN sizing strategy; measure first. |
| Returning visitors | Reloading the live product page with a saved cart repeatedly produced React error 418 (server/client HTML hydration mismatch). The page recovered visibly, but this should be fixed. A likely contributor is CartContext initializing empty on the server and immediately reading a populated localStorage cart in the browser; dates can also differ. Confirm the exact mismatch in a development reproduction. See [React error 418](https://react.dev/errors/418). |
| Accessibility | Improve FAQ keyboard access, gallery button names, popup focus management/Escape behavior, focus trapping, and the hidden cart's keyboard accessibility. Check contrast and touch targets. |
| SEO | Live robots.txt and sitemap.xml returned 404; product markup had no canonical or JSON-LD. Add appropriate canonicals, sitemap, product/offer markup, and an indexable HTML measuring guide. This is lower priority than purchase tracking for current Meta traffic. |
| Operations | Health endpoint only confirms the app responds. Monitor checkout success rate and latency, pricing failures, webhook delivery, and analytics delivery without exposing customer data. |

Observed load timings came from a fast, unthrottled browser and cache conditions varied. They are not mobile Core Web Vitals or a conversion benchmark. Measure real-user LCP, INP, and CLS, plus cold mobile performance; use [Google's Web Vitals guidance](https://web.dev/articles/vitals). No claim is made that speed is currently the principal source of lost sales.

**Meta verification before increasing spend**

Run the following with access to the relevant accounts and an authorized test order:

1. Confirm the active ad sets use the intended dataset/pixel and the intended purchase optimization event. Review destination URLs, actual creatives, geography, placement, spend, purchases, and attribution settings.
2. Test both ad → homepage → product and ad → product on real mobile browsers, including Meta's in-app browser. Check campaign and consent continuity to Shopify checkout.
3. Verify ViewContent, AddToCart, and InitiateCheckout with correct product IDs, configured value, and USD in Events Manager. Confirm expected behavior when creation fails or a shopper retries.
4. Complete a discounted order in an appropriate authorized test workflow. Check final amount, free shipping, payment options, thank-you page, order identity, and exactly one deduplicated Purchase. Test reload and webhook retry behavior.
5. Verify Meta diagnostics, event matching, catalog match rate if used, and browser/server deduplication. Compare matched orders with Shopify, recognizing that attributed ad purchases and total store orders are different measures.
6. Verify abandoned checkout and welcome email automations for this draft-order flow, then confirm buyers are removed from recovery messages. The presence of a reporting table is not proof that any recovery message is sent.

**Experiments after the defects are fixed**

| Experiment | Hypothesis | Primary measure |
|---|---|---|
| Delayed/inline lead capture versus the three-second popup | More visitors can understand the product before interruption | Paid purchase rate and contribution per visitor; signup rate secondary |
| Compact mobile hero plus “Choose my size” | More visitors start and finish configuration | Purchases per landing session, configuration completion |
| Integrated measuring help and saveable quote | Visitors without measurements can return and buy confidently | Completed orders from saved quotes, fit-related support and remake rate |
| Landing pages matched to actual ad themes | A night-shift, rental, or bedroom ad gets a directly relevant explanation and proof | Purchase rate and acquisition cost by creative and landing page |
| Clear multi-window ordering and “add another window” | Customers can equip more rooms with less repeated work | Contribution per visitor and average order value, with purchase rate as a guardrail |

Do not launch all variants together. Set the primary metric, required sample, minimum meaningful improvement, and duration from actual baseline traffic and purchase rate. Use purchases and contribution margin as the decision criteria, not a short-term rise in cart clicks. Add events for configuration start, measurement errors, guide opens, configuration completion, checkout creation/failure, and confirmed purchase. Keep customer contact details out of general analytics payloads.

**Validation completed**

`npm.cmd run pricing:validate` passed (112 price cells). `npm.cmd run lint` passed with zero errors and five existing image warnings in ProductReviews.tsx. No production build, real purchase, discount redemption, authenticated account journey, or production webhook delivery test was performed. Only this report and supporting audit screenshots were added to the repository; application code and live configuration were not changed.

Evidence images: [initial mobile popup](audit-evidence/home-mobile.png), [mobile product entry](audit-evidence/product-mobile.png), [configured mobile cart](audit-evidence/cart-mobile.png), [desktop product entry](audit-evidence/product-desktop.png).
