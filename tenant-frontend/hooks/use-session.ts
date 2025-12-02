"use client";

import authClient from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api-service";
import { UserProfile } from "@/types/types";

export function useSession() {
  const { data: session, isPending: authPending } = authClient.useSession();
  const user = session?.user || null;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    const load = async () => {
      try {
        const res = await apiService.user.getProfile();
        setProfile(res.success ? res.data : null);
      } catch {
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    load();
  }, [user]);

  return {
    user,
    session,
    profile,
    isLoading: authPending || loadingProfile,
  };
}
export function useOrganizationContext() {
  const { profile, isLoading } = useSession();

  const memberships = profile?.memberships || [];

  return {
    currentOrganizationId: memberships[0]?.organization?.id || null,
    currentMemberRole: memberships[0]?.role || null,
    organizationMemberships: memberships.map((m) => ({
      organizationId: m.organization.id,
      organization: m.organization,
      role: m.role,
      memberId: m.memberId,
      joinedAt: m.joinedAt,
    })),
    invitations: profile?.invitations || [],
    stats: profile?.stats || {},
    hasOrganization: memberships.length > 0,
    isOwner: memberships[0]?.role === "OWNER",
    isLoading,
  };
}
