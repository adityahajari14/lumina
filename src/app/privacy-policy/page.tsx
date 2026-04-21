import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Lumina Blackout Blinds",
  description:
    "Details on how Lumina Blackout Blinds collects, uses, and stores personal information.",
};

const sections = [
  {
    title: "Information We Collect",
    body: "We collect information submitted directly through this website, including name, email address, shipping details, account details, and order details. Technical information such as browser type, device type, and page activity may also be collected during site use.",
  },
  {
    title: "How We Use Your Information",
    body: "Information is used to process orders, manage accounts, provide customer support, send transactional communications, and operate and improve website functionality.",
  },
  {
    title: "Sharing and Disclosure",
    body: "Information is shared only with service providers required to operate core business functions, including authentication, ecommerce processing, payment processing, and order fulfillment. Personal information is not sold.",
  },
  {
    title: "Cookies and Tracking",
    body: "We use cookies and similar technologies to remember preferences, keep your cart active, and understand site usage. You can control cookies through your browser settings, though some features may not function properly if cookies are disabled.",
  },
  {
    title: "Data Retention",
    body: "We retain information only as long as needed for legitimate business purposes, legal obligations, dispute resolution, and contract enforcement.",
  },
  {
    title: "Your Rights",
    body: "Depending on your location, you may have rights to access, correct, delete, or restrict use of your personal data. To make a request, contact us using the details below.",
  },
  {
    title: "Data Security",
    body: "Administrative and technical safeguards are used to protect personal information. No system can guarantee absolute security.",
  },
  {
    title: "Contact Us",
    body: "For privacy questions or data requests, contact info@luminablackoutblinds.com.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full min-h-screen bg-[#f9fafb] py-10 md:py-16">
      <div className="max-w-240 mx-auto px-4 md:px-6 flex flex-col gap-8 md:gap-10">
        <section className="rounded-[28px] border border-[#e6ebf1] bg-white p-6 md:p-10 shadow-sm">
          <p className="font-sans text-[12px] tracking-[0.12em] uppercase text-[#657186] mb-4">
            Legal
          </p>
          <h1 className="font-playfair text-[#131720] text-4xl md:text-[52px] leading-[1.05]">
            Privacy Policy
          </h1>
          <p className="font-sans text-[15px] md:text-[16px] text-[#657186] mt-4 max-w-170">
            This policy describes how information is collected, used, and
            stored when this website is used or an order is placed.
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