import type { Metadata } from "next";
import MarketingShell from "@/components/marketing/MarketingShell";
import AboutPage from "@/features/home/AboutPage";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `About — ${APP_NAME}`,
  description: `Learn about ${APP_NAME}: privacy-first, GPS-free fleet management for owners and managers.`,
};

export default function AboutMarketingPage() {
  return (
    <MarketingShell>
      <AboutPage />
    </MarketingShell>
  );
}
