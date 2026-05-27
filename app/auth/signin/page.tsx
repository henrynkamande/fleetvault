import { Suspense } from "react";
import LoginPage from "@/features/auth/user/Login";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-[#F9F9F9] text-slate-600">
          Loading…
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
