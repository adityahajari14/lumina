import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Lumina Blackout Blinds",
  description:
    "Terms governing use of the Lumina Blackout Blinds website and related services.",
};

const sections = [
  {
    title: "Acceptance of Terms",
    body: "By accessing or using this website, you agree to these Terms of Service. If you do not agree, please do not use the site or place an order.",
  },
  {
    title: "Eligibility and Accounts",
    body: "Users are responsible for providing accurate account information and for activity under their account credentials.",
  },
  {
    title: "Products and Pricing",
    body: "Product details, availability, and pricing are provided as published on this site. If an error is identified, product or pricing information may be corrected.",
  },
  {
    title: "Orders and Payment",
    body: "Order submission does not guarantee acceptance. Orders may be declined or canceled due to availability, payment authorization, or risk review outcomes.",
  },
  {
    title: "Shipping and Returns",
    body: "Shipping timelines are estimates and may vary. Return eligibility is determined by the published return policy and may differ by product type.",
  },
  {
    title: "Intellectual Property",
    body: "All content on this site, including text, images, design, graphics, and trademarks, is owned by Lumina or its licensors and may not be used without permission.",
  },
  {
    title: "Prohibited Use",
    body: "You agree not to misuse the site, interfere with security, attempt unauthorized access, or use automated tools to extract data without written permission.",
  },
  {
    title: "Disclaimer of Warranties",
    body: "Except where required by law, the website and services are provided on an as-is and as-available basis without warranties of any kind.",
  },
  {
    title: "Limitation of Liability",
    body: "To the maximum extent permitted by law, Lumina is not liable for indirect, incidental, special, or consequential damages arising from your use of the site or products.",
  },
  {
    title: "Changes to These Terms",
    body: "These terms may be updated periodically. Updated terms are effective when posted on this page.",
  },
  {
    title: "Contact Us",
    body: "If you have questions about these terms, contact info@luminablackoutblinds.com.",
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="w-full min-h-screen bg-[#f9fafb] py-10 md:py-16">
      <div className="max-w-240 mx-auto px-4 md:px-6 flex flex-col gap-8 md:gap-10">
        <section className="rounded-[28px] border border-[#e6ebf1] bg-white p-6 md:p-10 shadow-sm">
          <p className="font-sans text-[12px] tracking-[0.12em] uppercase text-[#657186] mb-4">
            Legal
          </p>
          <h1 className="font-playfair text-[#131720] text-4xl md:text-[52px] leading-[1.05]">
            Terms of Service
          </h1>
          <p className="font-sans text-[15px] md:text-[16px] text-[#657186] mt-4 max-w-170">
            These terms govern website use, account access, and purchases made
            through this store.
          </p>
          <p className="font-sans text-[13px] text-[#8b95a5] mt-4">
            Effective date: April 21, 2026
          </p>
        </section>

        <section className="rounded-[28px] border border-[#e6ebf1] bg-white p-6 md:p-10 shadow-sm">
          <div className="flex flex-col gap-8">
            {sections.map((section) => (
              <article key={section.title} className="flex flex-col gap-2">
                <h2 className="font-playfair text-[#131720] text-[28px] leading-tight">
                  {section.title}
                </h2>
                <p className="font-sans text-[15px] leading-[1.75] text-[#445166]">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}