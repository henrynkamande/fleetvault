import type { Metadata } from "next";
import MarketingPageHero from "@/components/marketing/MarketingPageHero";
import MarketingShell from "@/components/marketing/MarketingShell";
import { APP_NAME } from "@/lib/constants";
import { MARKETING_CONTAINER } from "@/lib/marketingLayout";

const sections = [
  {
    title: "Using the service",
    body: [
      `You may use ${APP_NAME} to manage fleet operations, including vehicles, drivers, trips, expenses, income, reports, and related company records.`,
      "You are responsible for keeping account access secure, inviting only authorized users, and making sure information entered into the platform is accurate and lawful.",
    ],
  },
  {
    title: "Customer responsibilities",
    body: [
      "Customers are responsible for complying with transport, employment, tax, privacy, and data protection requirements that apply to their fleet operations.",
      "You must not use the platform to upload unlawful content, interfere with service security, attempt unauthorized access, or misuse another person's information.",
    ],
  },
  {
    title: "Billing and subscriptions",
    body: [
      `${APP_NAME} may offer trials, subscriptions, and per-vehicle billing. Pricing, trial terms, renewal dates, and cancellation options are shown during signup or in the billing area when available.`,
      "Fees are due according to the selected plan. If payment fails or a subscription is canceled, access to paid features may be limited or suspended.",
    ],
  },
  {
    title: "Data and content",
    body: [
      "You keep ownership of the operational data you submit. You grant us permission to process that data as needed to provide, secure, support, and improve the service.",
      "We may generate aggregated or de-identified insights that do not identify a specific customer, user, driver, or fleet.",
    ],
  },
  {
    title: "Availability and changes",
    body: [
      "We aim to provide a reliable platform, but the service may change, pause, or experience interruptions for maintenance, security, or operational reasons.",
      "We may update these terms from time to time. Continued use of the service after changes take effect means you accept the updated terms.",
    ],
  },
  {
    title: "Limitations",
    body: [
      `${APP_NAME} is an operational software tool. It does not replace professional legal, accounting, safety, tax, insurance, or regulatory advice.`,
      "To the fullest extent allowed by law, the service is provided without warranties beyond those expressly stated, and liability is limited as permitted by applicable law.",
    ],
  },
];

export const metadata: Metadata = {
  title: `Terms of Service — ${APP_NAME}`,
  description: `Review the terms for using ${APP_NAME} fleet management software.`,
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <MarketingPageHero
        eyebrow="Terms"
        title="Terms of Service"
        description={`These terms explain the basic rules for using ${APP_NAME}, including customer responsibilities, subscriptions, data handling, and service limitations.`}
      />

      <section className="py-14">
        <div className={`${MARKETING_CONTAINER} max-w-4xl`}>
          <p className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-700 shadow-sm">
            Last updated: June 15, 2026. These terms are written as a practical service overview and may be updated as the
            product evolves.
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
