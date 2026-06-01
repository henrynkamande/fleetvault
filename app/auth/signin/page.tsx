import { Suspense } from "react";
import LoginPage from "@/features/auth/user/Login";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-[#F9F9F9]" role="status">
          <LoadingSpinner size="lg" />
          <span className="sr-only">Loading</span>
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
