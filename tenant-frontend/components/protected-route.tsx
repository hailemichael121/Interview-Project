"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import authClient from "@/lib/auth-client";
import { useOrganizationContext } from "@/hooks/use-session";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOrganization?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireOrganization = false,
  redirectTo = "/auth/signin",
}: ProtectedRouteProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [authStatus, setAuthStatus] = useState<{
    isAuthenticated: boolean;
    hasSession: boolean;
  }>({ isAuthenticated: false, hasSession: false });

  const { hasOrganization, isLoading: orgLoading } = useOrganizationContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsChecking(true);
        const session = await authClient.getSession();
        const hasSession = !!session?.data?.user;

        setAuthStatus({
          isAuthenticated: hasSession,
          hasSession
        });

        if (!hasSession && requireAuth) {
          if (pathname !== redirectTo) {
            sessionStorage.setItem("redirectAfterAuth", pathname);
          }
          router.replace(redirectTo);
          return;
        }

        if (hasSession && (pathname === "/auth/signin" || pathname === "/auth/signup")) {
          const redirectTo = sessionStorage.getItem("redirectAfterAuth") || "/dashboard";
          sessionStorage.removeItem("redirectAfterAuth");
          router.replace(redirectTo);
          return;
        }

      } catch (error) {
        console.error("Auth check failed:", error);
        if (requireAuth) {
          router.replace(redirectTo);
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [requireAuth, router, redirectTo, pathname]);

  useEffect(() => {
    if (isChecking || !authStatus.isAuthenticated || !requireOrganization) return;

    if (!orgLoading && !hasOrganization && !pathname.includes("/organization/create")) {
      router.replace("/organization/create");
    }
  }, [authStatus.isAuthenticated, requireOrganization, orgLoading, hasOrganization, pathname, router, isChecking]);

  if (isChecking || (requireAuth && authStatus.isAuthenticated && orgLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !authStatus.isAuthenticated) {
    return null;
  }

  if (requireOrganization && !hasOrganization && !pathname.includes("/organization/create")) {
    return null;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;
}