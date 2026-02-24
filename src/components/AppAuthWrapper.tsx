"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import AuthGuard from "./AuthGuard";

export default function AppAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Landing page: no auth guard, no navigation
  if (pathname === "/") {
    return <>{children}</>;
  }

  // App pages: wrap with auth guard and navigation
  return (
    <AuthGuard>
      <Navigation />
      {children}
    </AuthGuard>
  );
}
