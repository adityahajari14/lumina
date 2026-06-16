# Blackout Blinds Shopify Setup

This guide covers what needs to be configured in Shopify and in deployment for `blackout-blinds`.

## Current Architecture

- `blackout-blinds` uses the same Shopify store as `Yournextblinds`.
- `blackout-blinds` should have its own Headless storefront entry in Shopify because it runs on a different domain.
- `blackout-blinds` should also use its own Shopify Market if you want a separate market/catalog setup from `Yournextblinds`.
- `blackout-blinds` should use its own database and pricing data.
- Orders are separated by Shopify source tagging:
  - `source:lumina`
  - `source:yournextblinds`
- Signed-in customer carts live in each app's own database.

## Important Limitation

Because both sites use the same Shopify store:

- checkout branding is shared unless you have separate market-specific checkout/account configurations available in your Shopify plan/setup
- customer account branding is also shared for the store by default
- if both sites target the same market in the same store, you should assume one shared checkout/account brand
- in standard Markets setup, the same country or region typically should not belong to two active markets at the same time, so separate markets work best when blackout has its own target market setup

## Headless Storefront Recommendation

Create a separate storefront inside Shopify's `Headless` channel for `blackout-blinds`.

Why this is recommended:

- the blackout site has a different domain
- Shopify customer account auth requires callback URIs, JavaScript origins, and logout URIs to be registered for the specific storefront/application setup
- separate storefronts give you separate API tokens
- Shopify treats a headless storefront as its own channel for order attribution and reporting

This does not mean creating a separate Shopify store.

Recommended structure:

- Keep one Shopify store
- Keep one database per app
- Create one Headless storefront for `Yournextblinds`
- Create one Headless storefront for `blackout-blinds`
- Create one Shopify Market for `Yournextblinds`
- Create one Shopify Market for `blackout-blinds`

## Headless Channel Setup

In Shopify admin:

1. Open `Sales channels > Headless`.
2. Click `Add storefront`.
3. Name it `Blackout Blinds`.
4. Generate the storefront tokens for this storefront.
5. Use the new blackout storefront tokens in the `blackout-blinds` deployment.

Important note:

- storefronts in the Headless channel have separate tokens
- storefronts in the same Headless channel still share Shopify API permissions at the shop level
- checkout is still the shared Shopify checkout for the store

## Market Recommendation

Create a separate Shopify Market for `blackout-blinds`.

Why this is recommended:

- the blackout brand has a different domain and storefront
- the blackout market only needs one product
- you can keep blackout merchandising separate from `Yournextblinds`
- if your Shopify setup supports market-specific checkout/account overrides, this gives you the right structure to use them

Recommended structure:

- `Yournextblinds` market: existing multi-product setup
- `Blackout Blinds` market: only the blackout product

Important note:

- if both brands sell to the exact same countries/regions, confirm your Markets setup supports the separation you want before depending on Markets alone
- for a headless storefront, market-specific product and pricing behavior can depend on the storefront context you send to Shopify
- because this app creates Shopify Draft Orders, market catalog restrictions are not the only enforcement layer for checkout

## Market Setup

In Shopify admin:

1. Open `Markets`.
2. Create a market named `Blackout Blinds`.
3. Assign the intended countries/regions or customer grouping for blackout.
4. Configure the market domain/subdomain only if you are using Shopify-managed market domains for hosted store surfaces.
5. In the blackout market catalog/product availability setup, include only `honeycomb-blackout-blind`.
6. Exclude all other products from the blackout market catalog.
7. If needed, set market-specific currency, language, taxes, and pricing behavior.

Recommended outcome:

- blackout market contains only the blackout product
- yournextblinds market contains the regular catalog
- order reporting stays easier to reason about alongside the source tags

## Shopify Product Setup

Confirm the blackout product exists in the same Shopify store with:

- Handle: `honeycomb-blackout-blind`
- Status: `Active`
- Available on the sales channel used by the headless storefront
- Included in the `Blackout Blinds` market/catalog only

Confirm the product has the pricing metafield used by the pricing engine:

- Metafield namespace/key: `custom.price_band_name`
- Value: must match the existing pricing band name already used in the shared pricing tables

If the product options used on the blackout site are controlled through Shopify/admin data, verify the expected option values exist for:

- blind color
- frame color
- opening direction

## Draft Order Limitation

The current blackout checkout flow creates Shopify Draft Orders.

Important implication:

- market/catalog restrictions are useful for merchandising and store organization
- draft orders are still created through the Admin API, so the blackout app should not rely on market catalog rules alone as the final product restriction

Operationally, the blackout site is already designed as a single-product storefront. Keep that assumption intact when making backend changes.

## Order Separation

The apps now tag draft orders automatically:

- `blackout-blinds` adds `source:lumina`
- `Yournextblinds` adds `source:yournextblinds`

Recommended Shopify admin setup:

1. Open `Orders` in Shopify admin.
2. Create a saved view filtered by `tag:source:lumina`.
3. Create a saved view filtered by `tag:source:yournextblinds`.
4. Use those views for fulfillment, support, and reporting.

## Webhooks

You should register Shopify webhooks for the blackout deployment domain.

Required endpoints:

- `https://<blackout-domain>/api/webhooks/shopify/orders-paid`
- `https://<blackout-domain>/api/webhooks/shopify/orders-cancelled`
- `https://<blackout-domain>/api/webhooks/shopify/refunds-create`

Optional health check:

- `https://<blackout-domain>/api/webhooks/shopify/health`

Recommended events:

- `orders/paid`
- `orders/cancelled`
- `refunds/create`

Notes:

- Both apps can receive webhooks from the same store.
- Each app now ignores orders that do not match its own source tag.
- `Yournextblinds` still accepts older untagged orders for backward compatibility.

## Customer Accounts

The blackout app uses Shopify customer accounts through these routes:

- `/login`
- `/account`

You need working customer account configuration in Shopify for the shared store.

Confirm:

- customer accounts are enabled in Shopify
- the customer account client credentials for the blackout Headless storefront are configured in deployment
- the account return/callback URLs match the blackout production domain

In the blackout storefront's Customer Account API settings, add:

- Callback URI(s): `https://<blackout-domain>/api/auth/shopify/callback`
- JavaScript origin(s): `https://<blackout-domain>`
- Logout URI(s): `https://<blackout-domain>`

## Checkout Branding

If you want checkout and account pages to look like `Blackout Blinds`, check what is possible in your Shopify plan first.

Default expectation with one store:

- one shared checkout brand
- one shared customer account brand

If your Shopify setup supports market-specific checkout/account configurations, then you can explore separate branding for blackout and yournextblinds by market. If not, use one shared brand or move blackout to a separate store.

## Environment Variables

Make sure these are set for the blackout deployment:

```env
DATABASE_URL=
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=
NEXT_PUBLIC_SHOPIFY_SHOP_ID=
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID=
NEXT_PUBLIC_SHOPIFY_ANALYTICS_CURRENCY=USD
NEXT_PUBLIC_SHOPIFY_ANALYTICS_LANGUAGE=EN
NEXT_PUBLIC_SHOPIFY_ANALYTICS_HAS_USER_CONSENT=true
SHOPIFY_STORE_DOMAIN=
SHOPIFY_ADMIN_ACCESS_TOKEN=
APP_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SHOPIFY_ACCOUNT_DOMAIN=
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET=
```

Notes:

- `DATABASE_URL` should point to the blackout app's own Postgres database
- `APP_URL` and `NEXT_PUBLIC_APP_URL` should use the blackout production domain
- `SHOPIFY_STORE_DOMAIN` stays the same because the Shopify store is shared
- the Storefront token and customer account client credentials should come from the blackout Headless storefront setup
- the Admin API token can stay the same because it belongs to the shared store
- `NEXT_PUBLIC_SHOPIFY_SHOP_ID` can be either the numeric shop ID or `gid://shopify/Shop/<id>`
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID` should be copied from the `Blackout Blinds` Headless storefront
- keep `NEXT_PUBLIC_SHOPIFY_ANALYTICS_HAS_USER_CONSENT=true` only if your cookie/privacy setup permits analytics processing before an explicit opt-in

## Separate Database Guidance

Each app should use its own database.

Recommended:

- keep the database URLs separate in deployment and local environments
- keep regular backups before launch
- treat cart, pricing, and order data as app-local

Caution:

- if you migrate existing cart data from a shared database, copy the rows into the target app's database first
- do not reuse the old shared-database customer-email prefixing scheme after migration

## Deployment Checklist

1. Set blackout production env vars.
2. Create a separate `Blackout Blinds` storefront in Shopify `Headless`.
3. Create a separate `Blackout Blinds` market in Shopify.
4. Add only `honeycomb-blackout-blind` to the blackout market/catalog.
5. Add the blackout domain to Customer Account API settings for the blackout storefront.
6. Deploy `blackout-blinds`.
7. Confirm `/api/health` returns success.
8. Register the three Shopify webhook URLs for the blackout domain.
9. Confirm the blackout product handle and pricing metafield in Shopify.
10. Test pricing on the product page.
11. Test add to cart.
12. Test checkout creation.
13. Complete one real or test order.
14. Confirm the order in Shopify has tag `source:lumina`.
15. Confirm the order appears in the `tag:source:lumina` saved view.
16. Confirm the order does not get processed by the `Yournextblinds` blackout-filtered webhook path.
17. Confirm Shopify Analytics starts showing visits for the `Blackout Blinds` headless storefront after production page views have been sent.

## Quick Verification

After deploy, verify these URLs:

- `https://<blackout-domain>/api/health`
- `https://<blackout-domain>/products`
- `https://<blackout-domain>/cart`
- `https://<blackout-domain>/login`
- `https://<blackout-domain>/account`

## Local Code Notes

Relevant implementation files:

- `src/lib/server/order.service.ts`
- `src/lib/server/cart.service.ts`
- `src/lib/server/shopify-order-source.ts`
- `src/app/api/webhooks/shopify/orders-paid/route.ts`
- `src/app/api/webhooks/shopify/orders-cancelled/route.ts`

## References

- Shopify checkout editor: https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-editor
- Shopify checkout style settings: https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-style
- Shopify customer account customization: https://help.shopify.com/en/manual/customers/customer-accounts/new-customer-accounts/customize
- Shopify Markets overview: https://help.shopify.com/en/manual/markets
- Shopify domains and international domains: https://help.shopify.com/manual/domains/manage-domains
- Shopify B2B and Markets overview: https://help.shopify.com/en/manual/b2b/markets
- Shopify order search/filtering: https://help.shopify.com/en/manual/fulfillment/managing-orders/viewing-orders/searching-orders
- Shopify webhooks: https://shopify.dev/docs/apps/build/webhooks/subscribe
