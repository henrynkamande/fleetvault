import type { Metadata } from "next";
import Homepage from "@/features/home/Homepage";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${APP_NAME} — GPS-Free Fleet Management`,
  description: `${APP_NAME} is a privacy-first fleet management system for vehicle owners and managers.`,
};

export default function MarketingHomePage() {
  return <Homepage />;
}
