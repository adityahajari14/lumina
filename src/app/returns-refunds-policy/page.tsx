import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Refunds Policy - Lumina Blackout Blinds',
  description:
    'Read the Lumina Blackout Blinds returns and refunds policy for made-to-measure blinds, including our 30-day return window, damaged items, faulty goods, replacements, cancellations, and refunds.',
};

const sections = [
  {
    title: '30-Day Returns',
    content: (
      <p>
        We want you to love your Lumina blind. If you are not completely satisfied, you may return
        your order within <strong>30 days</strong> of delivery for a full refund. To start a return,
        email us at{' '}
        <a href="mailto:info@luminablackoutblinds.com" className="underline">
          info@luminablackoutblinds.com
        </a>{' '}
        with your order number and reason for return. We will send you return instructions within 1
        business day.
      </p>
    ),
  },
  {
    title: 'Damaged or Faulty Orders',
    content: (
      <p>
        Please check your Lumina blind carefully as soon as it is delivered. If you believe your
        item has been damaged in transit or has a manufacturing fault, contact us within{' '}
        <strong>3 business days</strong> of delivery so we can resolve it quickly.
      </p>
    ),
  },
  {
    title: 'How to Contact Us',
    content: (
      <p>
        Email us at{' '}
        <a href="mailto:info@luminablackoutblinds.com" className="underline">
          info@luminablackoutblinds.com
        </a>{' '}
        with your order number, delivery details, and a clear explanation of the issue. Please
        include photographs where possible so we can review the problem quickly. We aim to respond
        within <strong>1 business day</strong>, and always within <strong>3 business days</strong>.
      </p>
    ),
  },
  {
    title: 'Before Installing Your Blind',
    content: (
      <p>
        If you are reporting damage or a possible fault, please do not fit, alter, or install the
        blind until we have reviewed your claim. Installation may affect our ability to assess
        whether the issue was caused during manufacturing, delivery, or fitting.
      </p>
    ),
  },
  {
    title: 'Packaging',
    content: (
      <p>
        Please keep the original packaging until you have inspected your order. If an item needs to
        be returned for inspection and the original packaging is no longer available, replacement
        packaging may be required and additional charges may apply.
      </p>
    ),
  },
  {
    title: 'Inspection and Outcome',
    content: (
      <p>
        We may ask for photographs, further information, or for the product to be returned before
        confirming the next step. If our review confirms a manufacturing fault or delivery damage,
        we will arrange a suitable resolution.
      </p>
    ),
  },
  {
    title: 'Replacements',
    content: (
      <p>
        Where a replacement is approved, we will provide a like-for-like replacement for the
        affected made-to-measure blind. Replacement orders must match the original order details,
        including measurements, colors, fabric, controls, and other selected specifications.
      </p>
    ),
  },
  {
    title: 'Returns of Faulty Items',
    content: (
      <p>
        If we ask you to return an item for inspection or replacement, it must be returned within{' '}
        <strong>30 days</strong> of return approval and in line with the instructions we provide.
      </p>
    ),
  },
  {
    title: 'Cancellations and Changes',
    content: (
      <p>
        Because Lumina blinds are made to your chosen measurements and specifications, orders cannot
        usually be changed or canceled once production has started. Please check all measurements
        and options carefully before placing your order.
      </p>
    ),
  },
  {
    title: 'Refunds',
    content: (
      <p>
        If we are unable to manufacture your order because an item becomes unavailable before
        production begins, we will contact you and issue a full refund. We may also cancel and
        refund an order where there is a payment issue, pricing error, stock issue, delivery
        restriction, or internal processing error.
      </p>
    ),
  },
  {
    title: 'Delivery Issues',
    content: (
      <p>
        Lumina orders are made to measure and dispatched after production. Delivery may require a
        signature. If a courier is unable to complete delivery after repeated attempts, re-delivery
        charges may apply. Items returned to us by the courier may be held for a limited period
        before disposal.
      </p>
    ),
  },
  {
    title: "Manufacturer's Guarantee",
    content: (
      <p>
        Lumina blinds include a <strong>1-year manufacturer&apos;s guarantee</strong> against
        confirmed manufacturing faults. This does not cover normal wear and tear, accidental damage,
        misuse, incorrect installation, alterations, fading from prolonged sunlight exposure, or use
        in unsuitable conditions.
      </p>
    ),
  },
  {
    title: 'Manufacturing Tolerances',
    content: (
      <p>
        As with all made-to-measure blinds, small manufacturing tolerances can occur. Please allow
        for a variance of <strong>+/- 4mm</strong>. If a blind falls within this tolerance, it is
        not deemed faulty and will not qualify for replacement or rejection on that basis.
      </p>
    ),
  },
];

export default function ReturnsRefundsPolicyPage() {
  return (
    <div className="w-full bg-white text-black">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold font-playfair mb-4">
            Returns &amp; Refunds Policy
          </h1>
          <p className="text-sm text-gray-500 mb-6">Last updated: June 13, 2026</p>
          <p className="text-gray-700 leading-relaxed">
            At Lumina, every blackout blind is made to measure for your window and checked before
            shipment. This policy explains our 30-day return window and what happens if your order
            arrives damaged, appears faulty, needs inspection, or cannot be fulfilled.
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
          <h2 className="text-xl font-semibold mb-4">Contact</h2>
          <p className="text-gray-700 leading-relaxed">
            For returns, refunds, or product issue queries, email{' '}
            <a href="mailto:info@luminablackoutblinds.com" className="underline">
              info@luminablackoutblinds.com
            </a>
            . We aim to respond within 1–3 business days.
          </p>
        </div>
      </div>
    </div>
  );
}
