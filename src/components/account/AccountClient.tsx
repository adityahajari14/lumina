'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

type OrderLineItem = {
  id: string | null;
  title: string;
  quantity: number;
  price: string;
  sku: string | null;
  configuration: Record<string, string>;
  properties: Array<{
    name: string;
    value: string;
  }>;
};

type OrderSummary = {
  id: string;
  name: string;
  createdAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  totalPrice: string;
  currencyCode: string;
  lineItems: OrderLineItem[];
};

type Address = {
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  zip: string | null;
  country: string | null;
};

type AccountClientProps = {
  customer: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
  orders: OrderSummary[];
  defaultAddress: Address | null;
};

export default function AccountClient({
  customer,
  orders,
  defaultAddress,
}: AccountClientProps) {
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Customer';
  const orderCount = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  const latestOrder = orders[0];
  const formatMoney = (amount: string | number, currencyCode = 'GBP') =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode,
    }).format(Number(amount || 0));
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  const statusClass = (status: string | null) => {
    const normalized = status?.toLowerCase();
    if (normalized === 'paid' || normalized === 'confirmed' || normalized === 'delivered') {
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }
    if (normalized === 'cancelled' || normalized === 'refunded') {
      return 'border-red-200 bg-red-50 text-red-700';
    }
    return 'border-[#dbe0e6] bg-[#f8fafc] text-[#657186]';
  };
  const formatLabel = (value: string) =>
    value
      .replace(/^_+/, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  const configurationEntries = (configuration: Record<string, string>) =>
    Object.entries(configuration).filter(([, value]) => value);

  return (
    <main className="w-full bg-[#f9fafb]">
      <section className="relative overflow-hidden bg-[#eaedf0] px-4 py-10 md:px-6 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_34%),linear-gradient(135deg,rgba(234,237,240,0.2),rgba(255,255,255,0.72))]" />
        <div className="relative mx-auto flex w-full max-w-[1248px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#657186]">
              Lumina account
            </span>
            <h1 className="mt-5 font-playfair text-4xl font-medium leading-tight text-[#131720] md:text-[56px]">
              Welcome back, {name}
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#657186]">
              Track your custom blackout blinds, review saved measurements, and keep your delivery details close at hand.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-[24px] border border-white/70 bg-white/80 p-4 shadow-[0_20px_45px_-28px_rgba(19,23,32,0.45)] backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#131720] font-playfair text-xl text-white">
              {name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#131720]">{customer.email}</p>
              <p className="text-xs text-[#657186]">{customer.phone || 'No phone added'}</p>
            </div>
            <UserButton />
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[1248px] gap-6 px-4 py-8 md:px-6 md:py-12 lg:grid-cols-12 lg:gap-8">
        <aside className="space-y-6 lg:col-span-4">
          <section className="rounded-[24px] border border-[#eaedf0] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9aa3af]">Overview</p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-[#f8fafc] p-4">
                <p className="font-playfair text-3xl text-[#131720]">{orderCount}</p>
                <p className="mt-1 text-xs text-[#657186]">Orders</p>
              </div>
              <div className="rounded-2xl bg-[#f8fafc] p-4">
                <p className="font-playfair text-3xl text-[#131720]">{latestOrder ? formatDate(latestOrder.createdAt).split(' ')[1] : '-'}</p>
                <p className="mt-1 text-xs text-[#657186]">Latest</p>
              </div>
              <div className="rounded-2xl bg-[#f8fafc] p-4">
                <p className="font-playfair text-3xl text-[#131720]">{totalSpent > 0 ? formatMoney(totalSpent, orders[0]?.currencyCode).replace(/\.\d+$/, '') : '-'}</p>
                <p className="mt-1 text-xs text-[#657186]">Spent</p>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-[#eaedf0] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaedf0] text-[#131720]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <div>
                <h2 className="font-playfair text-2xl text-[#131720]">Profile</h2>
                <p className="text-sm text-[#657186]">Managed by Clerk</p>
              </div>
            </div>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-[#9aa3af]">Name</dt>
                <dd className="mt-1 text-[#131720]">{name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-[#9aa3af]">Email</dt>
                <dd className="mt-1 break-all text-[#131720]">{customer.email}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-[#9aa3af]">Phone</dt>
                <dd className="mt-1 text-[#131720]">{customer.phone || 'Not added'}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[24px] border border-[#eaedf0] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaedf0] text-[#131720]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <div>
                <h2 className="font-playfair text-2xl text-[#131720]">Delivery Address</h2>
                <p className="text-sm text-[#657186]">Latest paid order</p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-[#f8fafc] p-4 text-sm leading-6 text-[#657186]">
              {defaultAddress ? (
                <>
                  <p className="font-medium text-[#131720]">{defaultAddress.address1 || '-'}</p>
                  {defaultAddress.address2 && <p>{defaultAddress.address2}</p>}
                  <p>{[defaultAddress.city, defaultAddress.province, defaultAddress.zip].filter(Boolean).join(', ') || '-'}</p>
                  <p>{defaultAddress.country || '-'}</p>
                </>
              ) : (
                <p>No delivery address has been saved from a paid order yet.</p>
              )}
            </div>
          </section>
        </aside>

        <section className="lg:col-span-8">
          <div className="rounded-[28px] border border-[#eaedf0] bg-white p-4 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 border-b border-[#edf1f6] pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9aa3af]">Saved after payment</p>
                <h2 className="mt-2 font-playfair text-3xl text-[#131720] md:text-4xl">Recent Orders</h2>
                <p className="mt-2 text-sm text-[#657186]">
                  Your order history is stored locally after Shopify confirms payment.
                </p>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full border border-[#dbe0e6] px-5 py-3 text-sm font-medium text-[#131720] transition-colors hover:border-[#131720]"
              >
                Shop Again
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eaedf0] text-[#131720]">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                  </svg>
                </div>
                <h3 className="mt-5 font-playfair text-2xl text-[#131720]">No orders yet</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#657186]">
                  Your custom blackout blind orders will appear here as soon as Shopify confirms payment.
                </p>
                <Link
                  href="/products"
                  className="mt-6 rounded-full bg-[#131720] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
                >
                  Build Your Blind
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#edf1f6]">
                {orders.map((order) => (
                  <article key={order.id} className="py-6 first:pt-6 last:pb-2">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-playfair text-2xl text-[#131720]">{order.name}</h3>
                          <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${statusClass(order.financialStatus)}`}>
                            {order.financialStatus || 'Paid'}
                          </span>
                          <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${statusClass(order.fulfillmentStatus)}`}>
                            {order.fulfillmentStatus || 'Confirmed'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[#657186]">{formatDate(order.createdAt)}</p>
                      </div>
                      <p className="font-playfair text-3xl text-[#131720]">
                        {formatMoney(order.totalPrice, order.currencyCode)}
                      </p>
                    </div>

                    {order.lineItems.length > 0 && (
                      <div className="mt-5 space-y-3">
                        {order.lineItems.map((item, index) => {
                          const entries = configurationEntries(item.configuration);

                          return (
                            <div
                              key={item.id || `${order.id}-${index}`}
                              className="rounded-[20px] border border-[#edf1f6] bg-[#fbfcfd] p-4"
                            >
                              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="font-medium text-[#131720]">
                                    {item.quantity}× {item.title}
                                  </p>
                                  {item.sku && <p className="mt-1 text-xs text-[#9aa3af]">SKU {item.sku}</p>}
                                </div>
                                <p className="text-sm font-medium text-[#131720]">
                                  {formatMoney(item.price, order.currencyCode)}
                                </p>
                              </div>

                              {entries.length > 0 && (
                                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                  {entries.map(([key, value]) => (
                                    <div key={key} className="rounded-2xl bg-white px-3 py-2">
                                      <p className="text-[11px] uppercase tracking-[0.14em] text-[#9aa3af]">
                                        {formatLabel(key)}
                                      </p>
                                      <p className="mt-1 text-sm text-[#131720]">{value}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

    </main>
  );
}
