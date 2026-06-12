import { redirect } from "next/navigation";
import { AppRoutesPaths } from "@/route/paths";

export default function RegisterCompanyPage() {
  redirect(AppRoutesPaths.dashboard.root);
}
