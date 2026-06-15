import type { Metadata } from "next";
import MarketingPageHero from "@/components/marketing/MarketingPageHero";
import MarketingShell from "@/components/marketing/MarketingShell";
import { APP_NAME } from "@/lib/constants";
import { MARKETING_CONTAINER } from "@/lib/marketingLayout";

const sections = [
  {
    title: "Information we collect",
    body: [
      "We collect account details, company profile information, vehicle and driver records, trip entries, odometer readings, expenses, income records, and billing information needed to operate the service.",
      "We may also collect technical information such as device, browser, IP address, and usage data to secure, maintain, and improve the platform.",
    ],
  },
  {
    title: "How we use information",
    body: [
      `We use data to provide ${APP_NAME}, support fleet operations, process subscriptions, improve product reliability, prevent abuse, and communicate important service updates.`,
      "Fleet records are used to help owners and managers understand trips, costs, driver assignments, vehicle activity, and reporting history.",
    ],
  },
  {
    title: "Driver privacy",
    body: [
      `${APP_NAME} is designed around verified operational records rather than live GPS surveillance. We do not require always-on location tracking to manage trips.`,
      "Managers are responsible for telling drivers how their information is used and for following employment, privacy, and transport rules in their region.",
    ],
  },
  {
    title: "Sharing and retention",
    body: [
      "We share information only with service providers that help us run the platform, comply with legal obligations, protect rights and safety, or complete business transactions.",
      "We retain information for as long as needed to provide the service, meet legal and accounting obligations, resolve disputes, and maintain audit-ready operational records.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You can update account and company information in the product. You may also request access, correction, deletion, or export of personal data where applicable law provides those rights.",
      "Some records may need to be retained when required for billing, security, compliance, dispute resolution, or legitimate business purposes.",
    ],
  },
];

export const metadata: Metadata = {
  title: `Privacy Policy — ${APP_NAME}`,
  description: `Learn how ${APP_NAME} collects, uses, and protects fleet management data.`,
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <MarketingPageHero
        eyebrow="Privacy"
        title="Privacy Policy"
        description={`${APP_NAME} is built for privacy-first fleet operations. This page explains what information we collect, how we use it, and the choices available to customers and users.`}
      />

      <section className="py-14">
        <div className={`${MARKETING_CONTAINER} max-w-4xl`}>
          <p className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-700 shadow-sm">
            Last updated: June 15, 2026. This policy is a general overview of how we handle information in the platform.
          </p>

          <div className="mt-8 space-y-5">
            {sections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#111827]">{section.title}</h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray-700">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
