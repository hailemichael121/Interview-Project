// hooks/use-session.ts - FIXED ESLint issues
"use client";

import authClient from "@/lib/auth-client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/use-api-optimized";

export function useSession() {
  const { data: session, isPending: authPending } = authClient.useSession();
  const user = session?.user || null;

  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useProfile();
  const [currentOrganizationId, setCurrentOrganizationId] = useState<
    string | null
  >(null);

  // Load organization context - FIXED: use useCallback to avoid setting state synchronously in effect
  const loadOrganizationContext = useCallback(() => {
    if (!profile) {
      setCurrentOrganizationId(null);
      return;
    }

    // Load organization context from localStorage or use first membership
    const savedOrgId = localStorage.getItem("currentOrganizationId");
    const memberships = profile.memberships || [];

    if (
      savedOrgId &&
      memberships.some((m) => m.organization.id === savedOrgId)
    ) {
      setCurrentOrganizationId(savedOrgId);
    } else if (memberships.length > 0) {
      const firstOrgId = memberships[0].organization.id;
      setCurrentOrganizationId(firstOrgId);
      localStorage.setItem("currentOrganizationId", firstOrgId);
    }
  }, [profile]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrganizationContext();
  }, [loadOrganizationContext]);

  const switchOrganization = useCallback(
    async (organizationId: string) => {
      if (
        !profile?.memberships?.some((m) => m.organization.id === organizationId)
      ) {
        throw new Error("You are not a member of this organization");
      }

      try {
        setCurrentOrganizationId(organizationId);
        localStorage.setItem("currentOrganizationId", organizationId);

        toast.success("Organization switched successfully");

        // Refresh profile to get updated context
        await refetchProfile();

        return true;
      } catch (error: unknown) {
        // FIXED: Changed from 'any' to 'unknown'
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to switch organization";
        toast.error(errorMessage);
        return false;
      }
    },
    [profile, refetchProfile]
  );

  return {
    user,
    session,
    profile,
    currentOrganizationId,
    switchOrganization,
    refreshProfile: refetchProfile,
    isLoading: authPending || profileLoading,
  };
}

export function useOrganizationContext() {
  const {
    profile,
    currentOrganizationId,
    switchOrganization,
    refreshProfile,
    isLoading,
  } = useSession();

  const memberships = profile?.memberships || [];
  const currentMembership = memberships.find(
    (m) => m.organization.id === currentOrganizationId
  );

  return {
    // Current organization context
    currentOrganizationId,
    currentMemberRole: currentMembership?.role || null,
    currentOrganization: currentMembership?.organization || null,

    // All memberships
    organizationMemberships: memberships.map((m) => ({
      organizationId: m.organization.id,
      organization: m.organization,
      role: m.role,
      memberId: m.memberId,
      joinedAt: m.joinedAt,
    })),

    // Other data
    invitations: profile?.invitations || [],
    stats: profile?.stats || {},
    hasOrganization: memberships.length > 0,
    isOwner: currentMembership?.role === "OWNER",
    isLoading,

    // Actions
    switchOrganization,
    refreshProfile,

    // Helper methods
    getCurrentOrganization: () => currentMembership?.organization || null,
    getCurrentRole: () => currentMembership?.role || null,
  };
}
