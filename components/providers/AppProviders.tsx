"use client";

import ApiProvider from "@/components/providers/ApiProvider";
import { AppToasts } from "@/components/providers/AppToasts";
import { StoreHydration } from "@/components/providers/StoreHydration";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApiProvider>
      <StoreHydration />
      <ThemeProvider>
        {children}
        <AppToasts />
      </ThemeProvider>
    </ApiProvider>
  );
}
