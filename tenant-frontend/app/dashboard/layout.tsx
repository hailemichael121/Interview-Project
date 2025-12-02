// app/dashboard/layout.tsx
"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useOrganizationContext } from "@/hooks/use-session";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { 
    currentOrganizationId, 
    organizationMemberships,
    isLoading 
  } = useOrganizationContext();

  // Get the current organization from memberships
  const currentOrganization = organizationMemberships.find(
    membership => membership.organizationId === currentOrganizationId
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-sm text-muted-foreground">Loading workspace...</div>
        </div>
      </div>
    );
  }

   if (!currentOrganization && organizationMemberships.length > 0) {
   
  }

  return (
    <DashboardLayout 
      organization={currentOrganization ? {
        id: currentOrganization.organizationId,
        name: currentOrganization.organization.name,
        role: currentOrganization.role as "owner" | "member" | "reviewer",
      } : undefined}
      memberships={organizationMemberships}
      isLoading={isLoading}
    >
      {children}
    </DashboardLayout>
  );
}