import { Suspense } from "react";
import BillingSuccess from "@/features/onboarding/BillingSuccess";

function BillingSuccessFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-[#D2D2D2] to-[#F9F9F9] text-slate-600">
      Loading…
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<BillingSuccessFallback />}>
      <BillingSuccess />
    </Suspense>
  );
}
