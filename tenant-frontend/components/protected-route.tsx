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
  organizationId,
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

        // Check authentication
        const session = await authClient.getSession();

        // Check if session exists and has data
        const hasValidSession = session && session.data && session.data.user;

        if (!hasValidSession && requireAuth) {
          setIsAuthenticated(false);
          setIsLoading(false);
          router.replace(redirectTo);
          return;
        }

        setIsAuthenticated(!!hasValidSession);

        // If organization is required, check if user has one
        if (requireOrganization && session?.data?.user) {
          try {
            // Get user's current organization context
            const userData = await apiService.user.getProfile();

            if (userData.success && userData.data) {
              // FIXED: Use memberships instead of context
              const hasOrg = userData.data.memberships && userData.data.memberships.length > 0;
              const currentOrgId = userData.data.memberships?.[0]?.organization.id || null;

              setHasOrganization(hasOrg);

              // If specific organization is required
              if (organizationId) {
                const isMember = userData.data.memberships?.some(
                  (m: any) => m.organization.id === organizationId
                ) || false;

                if (!isMember) {
                  router.replace("/dashboard");
                  return;
                }
              }

              // If no organization but required, redirect to create one
              if (
                requireOrganization &&
                !hasOrg &&
                !pathname.includes("/organization/create")
              ) {
                router.replace("/organization/create");
                return;
              }
            }
          } catch (error) {
            console.error("Error checking organization:", error);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoading(false);

        if (requireAuth) {
          router.replace(redirectTo);
        }
      }
    };

    checkAuth();
  }, [
    requireAuth,
    requireOrganization,
    organizationId,
    router,
    redirectTo,
    pathname,
  ]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-sm text-muted-foreground">
            Checking session...
          </div>
        </div>
      </div>
    );
  }

  // Check conditions
  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (
    requireOrganization &&
    !hasOrganization &&
    !pathname.includes("/organization/create")
  ) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

// Helper component for routes that require organization context
export function OrganizationProtectedRoute({
  children,
  organizationId,
}: {
  children: React.ReactNode;
  organizationId?: string;
}) {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireOrganization={true}
      organizationId={organizationId}
    >
      {children}
    </ProtectedRoute>
  );
}

// Helper component for public routes (no auth required)
export function PublicRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;
}