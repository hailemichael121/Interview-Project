"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
// lightweight protected wrapper

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isLoading } = useSession() as any;
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !session?.user) {
      // Not authenticated - redirect to sign in
      router.replace("/auth/signin");
    }
  }, [isLoading, session, router]);

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-pulse">Checking session...</div>
      </div>
    );
  }

  return <>{children}</>;
}
