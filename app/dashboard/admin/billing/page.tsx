import { redirect } from "next/navigation";
import { AppRoutesPaths } from "@/route/paths";

export default function AdminBillingRedirectPage() {
  redirect(AppRoutesPaths.dashboard.admin.subscriptions);
}
