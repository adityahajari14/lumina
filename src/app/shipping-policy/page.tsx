import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy - Lumina Blackout Blinds',
  description:
    'Review the Lumina Blackout Blinds shipping policy for US orders, including made-to-order production times, delivery estimates, tracking, and shipping restrictions.',
};

const sections = [
  {
    title: 'Order Processing Time',
    content: (
      <p>
        Every Lumina blind is made to order, so your product enters production after your order is
        confirmed. Unless a different estimate is shown on the product page or in your order
        communications, orders are usually delivered within <strong>14-18 working days</strong>.
        Once your blind has been completed and handed to the courier, we will send a shipping
        confirmation email with tracking details.
      </p>
    ),
  },
  {
    title: 'Shipping Times',
    content: (
      <p>
        Lumina currently ships within the United States only. The 14-18 working day estimate includes
        the time needed to make your blind, dispatch it, and deliver it to your address.
      </p>
    ),
  },
  {
    title: 'Free Shipping',
    content: (
      <p>
        Lumina offers free shipping on all orders, with no minimum spend required.
      </p>
    ),
  },
  {
    title: 'US-Only Shipping',
    content: (
      <p>
        Because Lumina only operates in the USA, all orders must be placed with a valid US shipping
        address. We do not support international freight forwarding, cross-border delivery, or
        non-US billing-to-shipping arrangements at this time.
      </p>
    ),
  },
  {
    title: 'Tracking Your Order',
    content: (
      <p>
        As soon as your order ships, we will email your tracking number so you can follow the
        delivery progress. If you believe your order should already have shipped and you have not
        received a confirmation email, please contact us at{' '}
        <a href="mailto:info@luminablackoutblinds.com" className="underline">
          info@luminablackoutblinds.com
        </a>
        . Including your order number will help us look into it faster.
      </p>
    ),
  },
  {
    title: 'Shipping Restrictions',
    content: (
      <p>
        We are currently unable to ship to PO boxes, military addresses, or addresses outside the
        United States. Please use a valid US residential or business address at checkout.
      </p>
    ),
  },
];

export default function ShippingPolicyPage() {
  return (
    <div className="w-full bg-white text-black">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold font-playfair mb-6">Shipping Policy</h1>
          <p className="text-gray-700 leading-relaxed">
            At Lumina, we want your made-to-measure blackout blind to arrive clearly, carefully, and
            without surprises. Lumina currently serves customers in the United States only. This
            policy explains how production, dispatch, delivery, and tracking work after you place an
            order.
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {sections.map((section) => (
            <div key={section.title} className="py-8">
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
              <div className="text-gray-700 leading-relaxed [&_p+p]:mt-3 [&_p+ul]:mt-3 [&_ul+p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about shipping or an order in progress, email us at{' '}
            <a href="mailto:info@luminablackoutblinds.com" className="underline">
              info@luminablackoutblinds.com
            </a>
            . Our team will be happy to help.
          </p>
        </div>
      </div>
    </div>
  );
}
