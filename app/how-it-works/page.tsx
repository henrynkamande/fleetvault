import type { Metadata } from "next";
import MarketingShell from "@/components/marketing/MarketingShell";
import HowItWorks from "@/features/home/HowItWorks";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `How It Works — ${APP_NAME}`,
  description: `See how ${APP_NAME} helps fleet owners manage trips, drivers, costs, and reports without live GPS tracking.`,
};

export default function HowItWorksMarketingPage() {
  return (
    <MarketingShell>
      <HowItWorks />
    </MarketingShell>
  );
}
