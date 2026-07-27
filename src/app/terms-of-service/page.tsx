import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Lumina Blackout Blinds',
  description:
    'Read the Terms & Conditions for using the Lumina Blackout Blinds website and purchasing our made-to-measure blackout blinds.',
};

const sections = [
  {
    title: 'Access and Account',
    content: (
      <>
        <p>
          By using this website or placing an order, you confirm that you are at least the age of majority in your
          state, province, or country of residence, or that you have permission from a parent or guardian to use the
          website and purchase from us.
        </p>
        <p>
          When you use our website or place an order, you may need to provide information such as your name, email
          address, billing details, payment details, and shipping address. You confirm that the information you provide
          is accurate, current, and complete, and that you have the right to provide it.
        </p>
        <p>
          If you create or access an account, you are responsible for keeping your login details secure and for all
          activity carried out through your account. You must not transfer, sell, assign, or license your account to
          another person.
        </p>
      </>
    ),
  },
  {
    title: 'Product',
    content: (
      <>
        <p>
          Product images are for illustration purposes only. Actual fabric colours and shades may vary slightly due
          to screen settings, lighting, and photography. We aim to manufacture the blinds as close as possible to the
          illustrations provided. As all our blinds are uniquely handcrafted, we do not compromise on quality, and
          all our products are manufactured to a high-quality standard.
        </p>
        <p>
          We make every reasonable effort to display products, colours, textures, dimensions, descriptions, prices, and
          availability accurately. However, colours and shading may appear differently depending on screen settings,
          device type, browser, and lighting conditions. Minor handcrafted variations may also occur.
        </p>
        <p>
          Product details, imagery, pricing, promotions, delivery information, and availability may be corrected or
          updated if an error, inaccuracy, or omission is identified.
        </p>
      </>
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
        The fabric will be cut by our high-class team within a variance of <strong>+/- 4mm</strong>. Please be aware
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
          A contract is formed once we send an order confirmation email to the address provided. The price displayed on
          the website at the time we receive your order applies. Prices are subject to change at any time. We take
          payment from you at the time you place your order using the payment details supplied by you during the
          checkout process.
        </p>
        <p>
          If a product is listed with an incorrect price or affected by a material pricing, availability, or system
          error, we may contact you to agree an alternative or cancel the order and issue a refund.
        </p>
        <p>
          Discount codes and promotions must be applied at checkout and cannot be added after an order has been placed.
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
    title: 'Delivery',
    content: (
      <>
        <p>
          Every Lumina blind is made to order. Unless a different estimate is shown on the product page or in your
          order communications, orders are usually delivered within <strong>7-11 working days</strong>. This includes
          the time needed to make your blind, dispatch it, and deliver it to your address.
        </p>
        <p>
          Lumina currently ships within the United States only and offers free shipping on all orders. Orders must be
          placed with a valid US residential or business shipping address. We are currently unable to ship to PO boxes,
          military addresses, or addresses outside the United States.
        </p>
        <p>
          Once your order has been completed and handed to the courier, we will send a shipping confirmation email with
          tracking details so you can follow the delivery progress.
        </p>
        <p>
          Delivery timeframes are estimates only and are not guaranteed. We will make reasonable efforts to manufacture,
          dispatch, and deliver your order within the timeframes shown on our website or in order communications.
        </p>
        <p>
          Some deliveries may require a signature. If the packaging appears damaged when it arrives, please sign for it
          as damaged where the courier allows and contact us as soon as possible.
        </p>
        <p>
          If delivery cannot be completed after repeated courier attempts, re-delivery charges may apply. Items returned
          to us by the courier may be held for a limited period before disposal.
        </p>
      </>
    ),
  },
  {
    title: '1 Year Guarantee',
    content: (
      <>
        <p>
          Lumina offers a 1 year manufacturer&apos;s guarantee on manufacturing faults. We will inspect the product
          and, if the issue can be resolved, we will repair it. If not, we will replace the product with a brand new
          one.
        </p>
        <p>This guarantee does not cover:</p>
        <ul>
          <li>Fair wear and tear.</li>
          <li>Misuse, accidental damage, pet damage, or alterations.</li>
          <li>Fading caused by prolonged exposure to sunlight.</li>
          <li>Incorrect installation or failure to follow fitting guidance.</li>
          <li>Products used in commercial, non-domestic, or unsuitable environments.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Defective and Damaged Goods',
    content: (
      <p>
        Lumina products go through a quality check process before dispatch. If you do experience any problems, please
        email us at info@luminablackoutblinds.com. You will have <strong>3 working days</strong> from receipt of your
        product to report any defective or damaged goods due to manufacturing, or damage caused during the delivery process.
        For any issues regarding the product, we will need photos so our management team can investigate. We may also
        ask for the product to be returned to us for inspection. Any queries will be dealt with in a highly
        professional and prompt manner.
      </p>
    ),
  },
  {
    title: 'Fault Inspections',
    content: (
      <>
        <p>
          Where a blind needs to be returned for inspection after a fault claim, it should be returned in its original
          packaging wherever possible and in line with the instructions we provide.
        </p>
        <p>
          If a returned blind is inspected and no manufacturing fault is found, we may charge the cost of returning the
          item to you.
        </p>
      </>
    ),
  },
  {
    title: 'Cancellations and Returns',
    content: (
      <>
        <p>
          Orders cannot usually be cancelled or changed once they have entered the manufacturing process, because each
          Lumina blind is made to your chosen measurements and specifications.
        </p>
        <p>
          If an item is discontinued or unavailable before production begins, we may offer a suitable alternative or
          issue a full refund.
        </p>
      </>
    ),
  },
  {
    title: 'Limitation of Liability',
    content: (
      <>
        <p>
          To the fullest extent permitted by law, Lumina will not be liable for indirect, incidental, special,
          punitive, or consequential loss, damage, cost, or expense arising from use of the website, use of our
          services, delays in delivery, or use or installation of our products.
        </p>
        <p>
          Our total liability for any claim relating to an order will not exceed the amount paid for the goods in that
          order, except where liability cannot legally be limited or excluded.
        </p>
      </>
    ),
  },
  {
    title: 'Privacy and Data Protection',
    content: (
      <>
        <p>
          We are committed to protecting your privacy. Personal information collected through this website is handled in
          accordance with our Privacy Policy.
        </p>
        <p>
          We may share personal information with Shopify, payment providers, couriers, fulfilment partners, and other
          service providers where needed to operate the website, process payment, fulfil your order, provide support, or
          as otherwise described in our Privacy Policy.
        </p>
      </>
    ),
  },
  {
    title: 'Condensation Disclaimer',
    content: (
      <>
        <p>
          Blinds and other window coverings may reduce airflow between a room and the window glass. In some
          environments, including rooms with high humidity, temperature differences, limited ventilation, or existing
          window seal issues, condensation may form on glass, frames, or surrounding surfaces.
        </p>
        <p>
          Condensation is an environmental condition and is not caused by a defect in the blind itself. Installing a
          blind may increase the likelihood of condensation by limiting air circulation near the window surface.
        </p>
        <p>
          Lumina is not liable for condensation, moisture build-up, water damage, staining, deterioration, mould,
          mildew, insulated glass unit issues, or secondary damage caused by excess indoor humidity. It is the property
          owner&apos;s responsibility to maintain suitable humidity levels, ventilation, and window condition.
        </p>
      </>
    ),
  },
  {
    title: 'Website Use and Intellectual Property',
    content: (
      <>
        <p>
          You may use this website for lawful personal or household purposes only. You must not misuse the website,
          interfere with its operation, attempt unauthorised access, or use it in a way that infringes the rights of
          others.
        </p>
        <p>
          The website, including its text, images, graphics, video, audio, trademarks, branding, product reviews,
          layout, design, and arrangement, is owned by Lumina, its affiliates, or its licensors and is protected by
          applicable intellectual property laws.
        </p>
        <p>
          You must not reproduce, distribute, modify, publicly display, republish, download, store, transmit, or create
          derivative works from website materials without our prior written consent, except as permitted by law.
        </p>
      </>
    ),
  },
  {
    title: 'Third-Party Links and Services',
    content: (
      <>
        <p>
          Our website may contain links, embedded features, payment tools, or other services provided by third parties,
          including Shopify and its affiliates. We are not responsible for the content, accuracy, availability, or
          practices of third-party websites or services.
        </p>
        <p>
          If you access third-party websites or use third-party services, you do so at your own risk and should review
          their policies and terms before engaging with them.
        </p>
      </>
    ),
  },
  {
    title: 'Relationship with Shopify',
    content: (
      <p>
        Lumina is powered by Shopify, which enables us to provide the online store and related services. Any sale or
        purchase made through this website is made directly with Lumina, and Shopify is not responsible for products
        purchased from us, order fulfilment, or any injury, loss, or damage relating to those purchases.
      </p>
    ),
  },
  {
    title: 'Manufacturing & Distribution',
    content: (
      <p>
        Our products are manufactured and distributed globally through our production facilities located in Texas (USA),
        Leeds (United Kingdom), and Guangzhou (China). These facilities support our international supply chain and enable
        the efficient fulfilment of customer orders across North America, Europe, Asia, and other global markets. Company
        reserves the right to manufacture, source, and distribute products from any of its facilities or approved
        partners as required to meet operational and customer requirements.
      </p>
    ),
  },
  {
    title: 'Optional Tools',
    content: (
      <>
        <p>
          We may provide access to customer tools or features offered by third parties. These tools are provided on an
          &quot;as is&quot; and &quot;as available&quot; basis, and we do not control or monitor every aspect of those
          tools.
        </p>
        <p>
          Your use of optional third-party tools is at your own risk, and you should make sure you understand and agree
          to the relevant third party&apos;s terms before using them. Any new features added to the website will also
          be subject to these Terms &amp; Conditions.
        </p>
      </>
    ),
  },
  {
    title: 'Feedback',
    content: (
      <>
        <p>
          If you submit reviews, suggestions, ideas, proposals, photographs, comments, or other feedback, you grant us
          a worldwide, royalty-free, transferable licence to use, reproduce, modify, publish, distribute, and display
          that feedback for business, marketing, product improvement, and website purposes.
        </p>
        <p>
          You confirm that you own or have the necessary rights to submit any feedback you provide, and that the
          feedback will not violate the rights of any third party or breach these Terms &amp; Conditions.
        </p>
      </>
    ),
  },
  {
    title: 'Prohibited Uses',
    content: (
      <>
        <p>You must not use the website or services:</p>
        <ul>
          <li>For any unlawful, fraudulent, abusive, or malicious purpose.</li>
          <li>To infringe intellectual property, privacy, or other rights.</li>
          <li>To submit false, misleading, offensive, defamatory, or harmful content.</li>
          <li>To upload or transmit viruses, malware, or other harmful code.</li>
          <li>To scrape, harvest, collect, or track personal information without permission.</li>
          <li>To interfere with, bypass, or circumvent security or access controls.</li>
        </ul>
        <p>
          We may suspend, disable, or terminate access if we believe any part of these Terms &amp; Conditions has been
          breached.
        </p>
      </>
    ),
  },
  {
    title: 'Agents',
    content: (
      <p>
        If you use, allow, or enable any autonomous or semi-autonomous software, bot, crawler, or agent to access or
        interact with the website, it must identify itself truthfully and must not conceal, misrepresent, overload, or
        misuse its access. We may restrict or block agent access at any time.
      </p>
    ),
  },
  {
    title: 'Termination',
    content: (
      <>
        <p>
          We may terminate this agreement or restrict access to the website or services at any time where we consider
          it necessary, including where these Terms &amp; Conditions have been breached.
        </p>
        <p>
          Any terms that by their nature should continue after termination will remain in effect, including provisions
          relating to intellectual property, feedback, limitation of liability, indemnification, privacy, governing law,
          and payment obligations.
        </p>
      </>
    ),
  },
  {
    title: 'Indemnification',
    content: (
      <p>
        You agree to indemnify and hold harmless Lumina, Shopify, and our affiliates, partners, officers, directors,
        employees, agents, contractors, licensors, and service providers from losses, damages, liabilities, costs, or
        claims arising from your breach of these Terms &amp; Conditions, your violation of law, your misuse of the
        website, or your infringement of third-party rights.
      </p>
    ),
  },
  {
    title: 'Severability',
    content: (
      <p>
        If any provision of these Terms &amp; Conditions is found to be unlawful, void, or unenforceable, that provision
        will be enforceable to the fullest extent permitted by law and the unenforceable part will be treated as
        severed. The remaining provisions will continue in full force.
      </p>
    ),
  },
  {
    title: 'Waiver and Entire Agreement',
    content: (
      <>
        <p>
          If we do not exercise or enforce a right or provision of these Terms &amp; Conditions, that does not mean we
          waive that right or provision.
        </p>
        <p>
          These Terms &amp; Conditions, together with any policies posted on this website, form the entire agreement
          between you and Lumina regarding your use of the website and services.
        </p>
      </>
    ),
  },
  {
    title: 'Assignment',
    content: (
      <p>
        You may not transfer or assign your rights or obligations under these Terms &amp; Conditions without our prior
        written consent. We may transfer, assign, or delegate these Terms and our rights or obligations without notice
        where permitted by law.
      </p>
    ),
  },
  {
    title: 'Changes to These Terms',
    content: (
      <p>
        You can review the most current version of these Terms &amp; Conditions on this page. We reserve the right to
        update, change, or replace any part of these Terms by posting changes to the website. Continued use of the
        website after changes are posted means you accept those changes.
      </p>
    ),
  },
  {
    title: 'Governing Law',
    content: (
      <p>
        These Terms &amp; Conditions and any separate agreements through which we provide products or services are
        governed by applicable law in the jurisdiction where Lumina operates, unless mandatory consumer protection laws
        in your location provide otherwise.
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
        their own risk. Except where expressly stated by Lumina, the website, services, and products are provided as
        available and without warranties or conditions of any kind to the fullest extent permitted by law. Please verify
        the accuracy of any information before acting upon it. We reserve the right to change information at any time
        without notice.
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
            website is maintained for your personal use and viewing. Please read our Terms &amp; Conditions carefully
            before using our website or placing an order. By accessing this website, purchasing from us, or installing
            our products, you agree to these Terms &amp; Conditions and our Privacy Policy. Lumina is powered by
            Shopify, which helps us provide the online store and related services. We reserve the right to change the
            Terms &amp; Conditions at any time. We advise you to review the Terms &amp; Conditions on a regular basis.
            Accessing and using this website after such changes have been posted constitutes acceptance by you of these
            conditions.
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
            or write to us at Carlinghow Mills, UNIT C2, Batley, ENG, WF17 8LL, GB.
          </p>
        </div>
      </div>
    </div>
  );
}
