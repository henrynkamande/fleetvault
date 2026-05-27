import type { Metadata } from "next";
import MarketingShell from "@/components/marketing/MarketingShell";
import PricingPage from "@/features/home/PricingPage";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Pricing — ${APP_NAME}`,
  description: `Simple per-vehicle pricing for ${APP_NAME}. Free trial, unlimited drivers, full fleet management.`,
};

export default function PricingMarketingPage() {
  return (
    <MarketingShell>
      <PricingPage />
    </MarketingShell>
  );
}
