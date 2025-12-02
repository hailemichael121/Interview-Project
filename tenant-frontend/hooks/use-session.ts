// hooks/use-session.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import authClient from "@/lib/auth-client";
import { apiService } from "@/lib/api-service";
import { UserProfile } from "@/lib/types";
import { SessionHelper } from "@/lib/session-helper";

interface BetterAuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified: boolean;
  banned: boolean;
  createdAt: Date;
  updatedAt: Date;
  tenantId?: string | null;
}

interface BetterAuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BetterAuthResponse {
  data?: {
    user: BetterAuthUser;
    session: BetterAuthSession;
  };
  error?: unknown;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  emailVerified: boolean;
  banned: boolean;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string | null;
}

export interface SessionData {
  user: SessionUser;
  expires: Date;
  sessionId: string;
  token?: string | null;
}

export interface UserContext {
  currentOrganizationId: string | null;
  currentMemberRole: string | null;
  organizationMemberships: Array<{
    organizationId: string;
    organization: { id: string; name: string; slug: string };
    role: string;
    memberId: string;
    joinedAt: string;
  }>;
  invitations?: Array<any>;
  stats?: {
    totalOrganizations: number;
    pendingInvitations: number;
    assignedOutlines: number;
  };
}

export interface UserWithContext extends SessionData {
  context: UserContext | null;
}

const transformMembershipsToContext = (
  memberships: UserProfile["memberships"] = [],
  invitations?: UserProfile["invitations"],
  stats?: UserProfile["stats"]
): UserContext | null => {
  if (memberships.length === 0) return null;

  return {
    currentOrganizationId: memberships[0].organization.id,
    currentMemberRole: memberships[0].role,
    organizationMemberships: memberships.map((m) => ({
      organizationId: m.organization.id,
      organization: {
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
      },
      role: m.role,
      memberId: m.memberId,
      joinedAt: m.joinedAt,
    })),
    invitations: invitations || [],
    stats,
  };
};

export function useSession() {
  const [data, setData] = useState<UserWithContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // hooks/use-session.ts - UPDATED fetchSession function
  const fetchSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First try authClient
      let authRes;
      try {
        authRes = await authClient.getSession();
      } catch (err) {
        console.log("Auth client session check failed, using manual check");
      }

      // If authClient fails, check localStorage
      if (!authRes?.data?.user) {
        const manualToken = SessionHelper.getToken();
        const manualUser = SessionHelper.getUser();

        if (manualToken && manualUser) {
          console.log("Using manually stored session");

          const sessionUser: SessionUser = {
            id: manualUser.id,
            email: manualUser.email,
            name: manualUser.name || null,
            image: manualUser.image || null,
            role: manualUser.role || "USER",
            emailVerified: manualUser.emailVerified || false,
            banned: manualUser.banned || false,
            createdAt: new Date(manualUser.createdAt || Date.now()),
            updatedAt: new Date(manualUser.updatedAt || Date.now()),
            tenantId: manualUser.tenantId || null,
          };

          const baseSession: SessionData = {
            user: sessionUser,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            sessionId: `manual_${manualUser.id}`,
            token: manualToken,
          };

          // Try to get full profile from backend
          try {
            const profileRes = await apiService.user.getProfile();
            if (profileRes.success && profileRes.data) {
              const profile = profileRes.data;
              const context = transformMembershipsToContext(
                profile.memberships,
                profile.invitations,
                profile.stats
              );
              setData({ ...baseSession, context });
            } else {
              setData({ ...baseSession, context: null });
            }
          } catch {
            setData({ ...baseSession, context: null });
          }
          return;
        }

        // No session found
        setData(null);
        return;
      }

      // Original logic for successful authClient session
      const authData = authRes.data;

      // Get full profile from backend
      const profileRes = await apiService.user.getProfile();

      if (!profileRes.success || !profileRes.data) {
        setData(null);
        return;
      }

      const profile = profileRes.data;

      const sessionUser: SessionUser = {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.name || profile.name || null,
        image: authData.user.image || profile.image || null,
        role: profile.role || "USER",
        emailVerified: authData.user.emailVerified,
        banned: profile.banned,
        createdAt: authData.user.createdAt,
        updatedAt: authData.user.updatedAt,
        tenantId: profile.tenantId || null,
      };

      const baseSession: SessionData = {
        user: sessionUser,
        expires: authData.session.expiresAt,
        sessionId: authData.session.id,
        token: authData.session.token,
      };

      const context = transformMembershipsToContext(
        profile.memberships,
        profile.invitations,
        profile.stats
      );

      // Store in SessionHelper for backup
      if (authData.session.token) {
        SessionHelper.setToken(authData.session.token);
        SessionHelper.setUser(authData.user);
      }

      setData({ ...baseSession, context });
    } catch (err) {
      console.error("Session error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
      setData(null);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return { data, isLoading, error, refresh: fetchSession, signOut };
}

export function useAuth() {
  const { data, isLoading, signOut } = useSession();
  return {
    user: data?.user || null,
    context: data?.context || null,
    isAuthenticated: !!data?.user,
    isLoading,
    signOut,
  };
}

export function useOrganizationContext() {
  const { data, isLoading } = useSession();
  const ctx = data?.context;

  return {
    currentOrganizationId: ctx?.currentOrganizationId || null,
    currentMemberRole: ctx?.currentMemberRole || null,
    organizationMemberships: ctx?.organizationMemberships || [],
    invitations: ctx?.invitations || [],
    stats: ctx?.stats || {},
    hasOrganization: (ctx?.organizationMemberships?.length || 0) > 0,
    isOwner: ctx?.currentMemberRole === "OWNER",
    isLoading,
  };
}
