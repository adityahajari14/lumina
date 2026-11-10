# Lumina Shopify theme

The theme source is `shopify/theme/`. It runs independently of the existing Next.js storefront.

| Item | Value |
| --- | --- |
| Store | `lumina-10621.myshopify.com` |
| Draft | **Lumina - Design Preview**, ID `157534552221` |
| Original live theme | `shopify-headless-theme-master`, ID `154578714781` |
| Preview | [Open draft](https://lumina-10621.myshopify.com/?preview_theme_id=157534552221) |
| Editor | [Customize draft](https://lumina-10621.myshopify.com/admin/themes/157534552221/editor) |
| Product | [Open product preview](https://lumina-10621.myshopify.com/products/honeycomb-blackout-blind?preview_theme_id=157534552221) |

## Editing in Shopify

- Home and product content use native Liquid sections and JSON templates. Use the editor to reorder sections and supported blocks, edit text, replace media, and adjust section width, background, and spacing.
- Header supports a Shopify navigation menu or the included local navigation blocks. Footer links and copy are editable.
- Theme settings control colors, fonts, guarantee badge labels, featured product, guide links, and the welcome popup.
- Product blocks include title, description, rating, price, gallery, variant selection, guarantees, promotion, app blocks, purchase buttons, accordions, and custom Liquid. Choose original design images or Shopify product media in Product settings.
- The product template now defaults to the existing product's first 20 media items, matching the original storefront. Product settings control the media limit and sticky purchase bar. Price settings control the published sale percentage, countdown and delivery estimate; promotion copy, payment-badge style and trust items remain editable. These display settings do not change checkout pricing.
- The **Fit promise dialog** section contains editable, reorderable promise details. Selecting it in the editor opens the dialog.
- The gallery, image zoom, FAQ, mobile menu, cart drawer, and dialogs use native browser controls and theme JavaScript. Newsletter forms submit to Shopify's customer form endpoint.
- Policy and guide templates use theme-only preview routes such as `/?view=shipping-policy` and `/?view=measuring-guide`. They do not replace shared Shopify policy records or create shared pages.

## Judge.me

The draft's **Judge.me core app embed** is enabled. The product reviews section contains the native Judge.me Review Widget app block; the homepage uses the selected product's Judge.me widget data. Rating badges use the same product's metafields.

The preview displayed **4.8 / 115 reviews** during verification. The original-design layout uses real Judge.me structured metafields for the histogram, photos, and first four reviews. “View all reviews” opens the complete native widget; “Write a review” opens its native form. The section also supports the full app layout. Review moderation and collection remain in Judge.me. Keep its app embed enabled; the legacy loader stays off to avoid duplicate scripts.

## Live Product Options and launch status

The official LPO app embed and product block are installed in the draft. Configuration `cloabjnzsxen` targets the existing blind and contains inches/centimetres, width and height limits, four fabric colors, two frame colors, and four opening directions. Split opening adds $75. The live theme has no LPO embed. The shared product's base price remains unchanged at zero.

`tools/build-lpo-options.cjs` generates both dimension formulas from the existing 112-cell price matrix and checks 448 inch/cm and fractional-boundary cases. `lpo-design.css` contains the saved app styling. Credentials and generated MCP payloads stay in ignored `.local/lpo/`. The theme displays the matrix minimum as “From $148.57” and listens to LPO's `options:price` event. It does not display a surcharge alone as the blind's total.

`pricing-matrix.csv` is a human-readable export with upper size-band limits, for reviewing the amounts. It is not an LPO price-list import: LPO's list lookup uses different threshold semantics. The stored formulas implement the source's ceiling-band behavior directly. Native decimal measurement inputs replace the original separate fraction selectors. The product price, sale summary and sticky bar update together from LPO price events.

**Pending:** the current LPO subscription does not calculate the dimension formulas. The storefront test produced only the $75 opening surcharge. The Formula extension is listed at +$9/month; no billing change was made, and approval is pending. After enabling it, run `tools/verify-lpo.cjs` and validate the real prices, range validation, cart properties, totals, and checkout. App-block presence alone does not validate pricing.

**Enable purchasing after LPO configuration** remains off. Both purchase buttons are disabled. Do not enable until formula and checkout validation pass.

## Homepage popup

The homepage-only native dialog matches the fullscreen desktop/mobile composition. Theme settings control enablement, delay, image and form copy; the **Homepage welcome popup** section controls the story, benefits, cooldown, success copy and code. Default delay is 3 seconds and dismissal cooldown is 15 minutes. Section selection opens it in the editor.

The form uses Shopify's customer endpoint and shows the existing active `SUBSCRIBE15` code after successful signup. That discount is 15%, once per customer, all products, and restricted to the **Email subscribers** segment. Customers must use their subscribed email address; double opt-in, if enabled, may require confirmation. No discount was created or changed. The form does not send an automatic discount email. Customer-form submission and checkout redemption still require a launch test. The existing `FINAL15` promotion was also confirmed active.

The draft has not been published. No product, live-theme, Next.js, domain, or DNS changes were made. Both storefront implementations remain available. Previewing the Shopify draft requires no switch. A public switch later requires publishing this theme and deciding which domain serves each storefront; it is not a Next.js environment toggle. Keep the existing Next.js deployment and original Shopify theme available for rollback. Publication and domain changes await the owner's explicit instruction.

## Developer workflow

Edit `theme/` directly. The Next.js app's package files are unchanged. Theme tooling has separate dependencies in `tools/package.json`.

Rebuild utility CSS after changing theme utility classes:

```powershell
node shopify/tools/build-css.cjs
node --check shopify/theme/assets/lumina-theme.js
node --env-file=.env.local shopify/tools/shopify.cjs theme check --path shopify/theme --output json
```

The CLI wrapper reads `SHOPIFY_CLI_THEME_TOKEN` from the process environment and restricts existing-theme pushes to the ID in `theme-target.json`. It rejects publishing and live-theme flags. Install Shopify CLI in the workspace npm cache if needed:

```powershell
$env:npm_config_cache = Join-Path (Get-Location) 'node_modules/.cache/npm-shopify'
npm.cmd exec --yes --package=@shopify/cli@4.8.2 -- shopify version
```

Pull the draft before changing files that someone has edited through Shopify. Use `--only` when uploading a code fix so unrelated editor changes remain intact. A full push can overwrite JSON templates and section groups. Preserve `config/settings_data.json` unless deliberately updating theme settings or app embeds:

```powershell
node --env-file=.env.local shopify/tools/shopify.cjs theme push --store lumina-10621.myshopify.com --path shopify/theme --theme 157534552221 --ignore config/settings_data.json --json
```

`build-theme.cjs`, `customize-theme.cjs`, `native-product.cjs`, `finalize-native.cjs`, `production-polish.cjs`, `finish-accessibility.cjs`, `editable-dialogs.cjs`, `connect-judgeme.cjs`, `apply-fidelity.cjs`, and `finish-fidelity.cjs` are historical migration records. They are disabled by default. **Do not rerun them on the current theme**: they can overwrite later refinements. `build-css.cjs` is the supported ongoing build command.

Browser checks run with locally installed Chrome:

```powershell
node shopify/tools/verify-fidelity.cjs
node shopify/tools/verify-final-draft.cjs
node shopify/tools/verify-product-design.cjs
node shopify/tools/verify-lpo.cjs
```

Reports and screenshots are written to ignored `shopify/.local/`. These checks cover the design preview and review controls; they do not submit reviews, newsletter forms, or orders and are not an end-to-end LPO checkout certification.

Native section architecture reference: [Shopify section schema](https://shopify.dev/docs/storefronts/themes/architecture/sections/section-schema).
