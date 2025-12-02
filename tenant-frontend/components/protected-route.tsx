"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import authClient from "@/lib/auth-client";
import { apiService } from "@/lib/api-service";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOrganization?: boolean;
  redirectTo?: string;
  organizationId?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireOrganization = false,
  redirectTo = "/auth/signin",
}: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasOrganization, setHasOrganization] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);

        const session = await authClient.getSession();
        const user = session?.data?.user;

        if (!user && requireAuth) {
          if (pathname !== redirectTo) {
            sessionStorage.setItem("redirectAfterAuth", pathname);
          }
          router.replace(redirectTo);
          return;
        }

        setIsAuthenticated(!!user);

        if (
          user &&
          (pathname === "/auth/signin" || pathname === "/auth/signup")
        ) {
          const redirectTo =
            sessionStorage.getItem("redirectAfterAuth") || "/dashboard";
          sessionStorage.removeItem("redirectAfterAuth");
          router.replace(redirectTo);
          return;
        }

        if (requireOrganization && user) {
          try {
            const profileRes = await apiService.user.getProfile();

            if (profileRes.success && profileRes.data) {
              const memberships = profileRes.data.memberships || [];
              const hasOrg = memberships.length > 0;

              setHasOrganization(hasOrg);

              // if (!hasOrg && !pathname.includes("/organization/create")) {
              //   router.replace("/organization/create");
              //   return;
              // }
            } else {
              setHasOrganization(false);
              // if (!pathname.includes("/organization/create")) {
              //   router.replace("/organization/create");
              //   return;
              // }
            }
          } catch (profileError) {
            console.error("Error fetching profile:", profileError);
            // if (!pathname.includes("/organization/create")) {
            //   router.replace("/organization/create");
            //   return;
            // }
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsLoading(false);
        if (requireAuth) {
          router.replace(redirectTo);
        }
      }
    };

    checkAuth();
  }, [requireAuth, requireOrganization, router, redirectTo, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Checking session...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (
    requireOrganization &&
    !hasOrganization &&
    !pathname.includes("/organization/create")
  ) {
    return null;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;
}
