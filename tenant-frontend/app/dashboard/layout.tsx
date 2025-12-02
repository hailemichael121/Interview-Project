"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useOrganizationContext } from "@/hooks/use-session";
import authClient from "@/lib/auth-client";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user || null;

  const { isLoading: orgLoading } = useOrganizationContext();

  useEffect(() => {
    if (!sessionPending && !user) {
      router.replace("/auth/signin");
    }
  }, [user, sessionPending, router]);

  if (sessionPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Checking your session...
      </div>
    );
  }

  if (!user) return null;

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading organization data...
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
