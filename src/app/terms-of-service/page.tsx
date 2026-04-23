import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Lumina Blackout Blinds',
  description:
    'Read the Terms & Conditions for using the Lumina Blackout Blinds website and purchasing our made-to-measure blackout blinds.',
};

const sections = [
  {
    title: 'Product',
    content: (
      <p>
        The images are purely for illustration purposes only. We aim to manufacture the blinds as close as possible to
        the illustrations provided. As all our blinds are uniquely handcrafted, we do not compromise on quality, and
        all our products are manufactured to a high-quality standard. Our products are accurately displayed on the
        website; however, depending on your screen monitor, the colour or shading may appear differently on different
        screen types. You can also view the website on different platforms such as mobile devices (Android and iOS)
        including tablets, as the website is user friendly.
      </p>
    ),
  },
  {
    title: 'Measurements',
    content: (
      <>
        <p>
          The goods that you order are manufactured according to the measurements you provide. It is vital that you
          take the correct measurements of your window. If you are unsure, please visit our Measuring &amp; Fitting
          guide on our website for further information, or contact us by email for guidance on how to take the required
          measurements accurately.
        </p>
        <p>
          Please ensure that before placing your order online you check the product details and measurements of the
          goods.{' '}
          <strong>
            We cannot accept returns or refund the money if you have given us incorrect measurements
          </strong>
          , as we will not be able to resell the goods — they are made to measure and bespoke.
        </p>
      </>
    ),
  },
  {
    title: 'Made to Measure Products',
    content: (
      <p>
        Once the product is made to your precise requirements, it is only suitable for you and therefore cannot be
        cancelled or returned. It is important to check the product you want and the size you require.{' '}
        <strong>
          Double check your order to ensure that the products ordered and measurements taken are correct.
        </strong>
      </p>
    ),
  },
  {
    title: 'Fabric',
    content: (
      <p>
        Our fabrics are made from raw materials into high quality with different shades and variations. The colour on
        fabrics is dyed, therefore shades can be slightly different per batch. The print design of some pattern fabrics
        may not show the full range of colours or pattern design on the sample. If you are unsure about the fabrics,
        please contact us via email at info@luminablackoutblinds.com for further information.
      </p>
    ),
  },
  {
    title: 'Tolerance',
    content: (
      <p>
        The fabric will be cut by our high-class team within a variance of <strong>+/- 3cm</strong>. Please be aware
        that if the sizes are within this tolerance limit, we will not replace the order and you will not be entitled
        to reject the goods.
      </p>
    ),
  },
  {
    title: 'Price & Payment',
    content: (
      <>
        <p>
          The price displayed on the website at the time we receive your order applies. Prices are subject to change
          at any time. We take payment from you at the time you place your order using the credit or debit card details
          supplied by you during the checkout process.
        </p>
        <p>Information that we need to process your order:</p>
        <ul>
          <li>Full name</li>
          <li>Contact number</li>
          <li>Address / postcode</li>
          <li>Email address</li>
          <li>Debit / credit card details</li>
        </ul>
      </>
    ),
  },
  {
    title: '1 Year Guarantee',
    content: (
      <p>
        Lumina offers a 1 year manufacturer&apos;s guarantee on manufacturing faults. We will inspect the product and,
        if the issue can be resolved, we will repair it. If not, we will replace the product with a brand new one.
      </p>
    ),
  },
  {
    title: 'Defective and Damaged Goods',
    content: (
      <p>
        Lumina products go through a quality check process before dispatch. If you do experience any problems, please
        email us at info@luminablackoutblinds.com. You will have <strong>7 days</strong> from receipt of your product
        to report any defective or damaged goods due to manufacturing, or damage caused during the delivery process.
        For any issues regarding the product, we will need photos so our management team can investigate. We may also
        ask for the product to be returned to us for inspection. Any queries will be dealt with in a highly
        professional and prompt manner.
      </p>
    ),
  },
  {
    title: 'Disclaimer',
    content: (
      <p>
        Lumina will take every care and precaution to ensure that the contents and information published on this
        website are accurate and up to date. Unfortunately, we cannot guarantee the accuracy of contents or
        information contained in its pages, and any person using information contained in them does so entirely at
        their own risk. Please verify the accuracy of any information before acting upon it. We reserve the right to
        change information at any time without notice.
      </p>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="w-full bg-white text-black">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-semibold font-playfair mb-6">Terms &amp; Conditions</h1>
          <p className="text-gray-700 leading-relaxed">
            Lumina is a trading name of <strong>Online Blinds Express Ltd</strong>. Using our Lumina Blackout Blinds
            website is maintained for your personal use and viewing. Please read our Terms &amp; Conditions carefully.
            Accessing and using this website constitutes acceptance by you of these conditions. We reserve the right to
            change the Terms &amp; Conditions at any time. We advise you to review the Terms &amp; Conditions on a
            regular basis. Accessing and using this website after such changes have been posted constitutes acceptance
            by you of these conditions.
          </p>
        </div>

        {/* Sections */}
        <div className="divide-y divide-gray-200">
          {sections.map((section) => (
            <div key={section.title} className="py-8">
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
              <div className="text-gray-700 leading-relaxed [&_p+p]:mt-3 [&_p+ul]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-gray-700 leading-relaxed">
            Should you have any questions about these Terms &amp; Conditions, please contact us at{' '}
            <a href="mailto:info@luminablackoutblinds.com" className="underline">
              info@luminablackoutblinds.com
            </a>{' '}
            or write to us at Carlinghow Mills, UNIT C41A, Batley, ENG, WF17 8LL, GB.
          </p>
        </div>
      </div>
    </div>
  );
}
