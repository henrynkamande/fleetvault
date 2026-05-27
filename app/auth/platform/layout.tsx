"use client";

import PlatformGuestRoute from "@/components/auth/PlatformGuestRoute";

export default function PlatformAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlatformGuestRoute>{children}</PlatformGuestRoute>;
}
