import type { Metadata } from "next";
import MarketingShell from "@/components/marketing/MarketingShell";
import BlogPage from "@/features/home/BlogPage";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Blog — ${APP_NAME}`,
  description: `News and guides from ${APP_NAME} on fleet operations, product updates, and profitability.`,
};

export const revalidate = 300;

export default function BlogMarketingPage() {
  return (
    <MarketingShell>
      <BlogPage />
    </MarketingShell>
  );
}
