// hooks/use-session.ts - UPDATED VERSION
"use client";

import { useState, useEffect, useCallback } from "react";
import authClient from "@/lib/auth-client";
import { apiService } from "@/lib/api-service";
import { useRouter } from "next/navigation";

// Better Auth types based on actual response
interface BetterAuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string;
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
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface BetterAuthResponse {
  data?: {
    user: BetterAuthUser;
    session: BetterAuthSession;
  };
  error?: any;
}

// Our application session types
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
  user: SessionUser | null;
  expires: Date | null;
  sessionId: string | null;
  token?: string | null;
}

export interface UserContext {
  currentOrganizationId: string | null;
  currentMemberRole: string | null;
  organizationMemberships: Array<{
    organizationId: string;
    organization: {
      id: string;
      name: string;
      slug: string;
    };
    role: string;
    memberId: string;
    joinedAt: string;
  }>;
}

export interface UserWithContext extends SessionData {
  context?: UserContext | null;
}

// Session state interface
interface UseSessionReturn {
  data: UserWithContext | null;
  session: SessionData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Main session hook that manages authentication state
 * Combines Better Auth session with backend user context
 */
export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<SessionData | null>(null);
  const [userWithContext, setUserWithContext] = useState<UserWithContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch session data from Better Auth
  const fetchAuthSession = useCallback(async (): Promise<BetterAuthResponse | null> => {
    try {
      const response = await authClient.getSession();
      return response as BetterAuthResponse;
    } catch (error) {
      console.error("Better Auth session error:", error);
      return null;
    }
  }, []);

  // Fetch user context from backend
  const fetchUserContext = useCallback(async (userId: string): Promise<UserContext | null> => {
    try {
      const userData = await apiService.user.getCurrentUser();
      
      if (userData.success && userData.data?.context) {
        return userData.data.context;
      }
      return null;
    } catch (error) {
      console.warn("Failed to fetch user context:", error);
      return null;
    }
  }, []);

  // Transform Better Auth response to our SessionData
  const transformSession = useCallback((authResponse: BetterAuthResponse | null): SessionData | null => {
    if (!authResponse?.data?.user || !authResponse.data.session) {
      return null;
    }

    const { user, session: authSession } = authResponse.data;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || null,
        image: user.image || null,
        role: user.role || "USER",
        emailVerified: user.emailVerified,
        banned: user.banned,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        tenantId: user.tenantId || null,
      },
      expires: authSession.expiresAt,
      sessionId: authSession.id,
      token: authSession.token,
    };
  }, []);

  // Main session fetch function
  const fetchSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Get session from Better Auth
      const authResponse = await fetchAuthSession();
      
      // 2. Transform to our format
      const sessionData = transformSession(authResponse);
      
      if (!sessionData) {
        setSession(null);
        setUserWithContext(null);
        return;
      }

      setSession(sessionData);

      // 3. Fetch additional context from backend
      const context = await fetchUserContext(sessionData.user.id);

      const fullUserData: UserWithContext = {
        ...sessionData,
        context: context || undefined,
      };

      setUserWithContext(fullUserData);
    } catch (error) {
      console.error("Session fetch error:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch session");
      setSession(null);
      setUserWithContext(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAuthSession, transformSession, fetchUserContext]);

  // Refresh session function
  const refreshSession = useCallback(async () => {
    await fetchSession();
  }, [fetchSession]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
      setSession(null);
      setUserWithContext(null);
    } catch (error) {
      console.error("Sign out error:", error);
      setError(error instanceof Error ? error.message : "Failed to sign out");
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return {
    data: userWithContext,
    session,
    isLoading,
    error,
    refresh: refreshSession,
    signOut,
  };
}

/**
 * Hook to check user roles
 */
export function useRole() {
  const { data, isLoading } = useSession();

  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!data?.user?.role) return false;

    const userRole = data.user.role.toUpperCase();
    const requiredRoles = Array.isArray(role)
      ? role.map((r) => r.toUpperCase())
      : [role.toUpperCase()];

    return requiredRoles.includes(userRole);
  }, [data]);

  const isAdmin = useCallback(() => hasRole(["ADMIN", "OWNER"]), [hasRole]);
  const isReviewer = useCallback(() => hasRole(["REVIEWER", "OWNER", "ADMIN"]), [hasRole]);
  const isMember = useCallback(() => hasRole(["MEMBER", "REVIEWER", "OWNER", "ADMIN"]), [hasRole]);

  return {
    role: data?.user?.role || null,
    hasRole,
    isAdmin,
    isReviewer,
    isMember,
    isLoading,
  };
}

/**
 * Hook to manage organization context
 */
export function useOrganizationContext() {
  const { data, isLoading } = useSession();

  const currentOrganizationId = data?.context?.currentOrganizationId || null;
  const currentMemberRole = data?.context?.currentMemberRole || null;
  const organizationMemberships = data?.context?.organizationMemberships || [];

  const hasOrganization = organizationMemberships.length > 0;
  const isOwner = currentMemberRole === "OWNER";
  const isOrganizationReviewer = ["REVIEWER", "OWNER"].includes(currentMemberRole || "");
  const isOrganizationMember = ["MEMBER", "REVIEWER", "OWNER"].includes(currentMemberRole || "");

  const switchOrganization = useCallback(async (organizationId: string) => {
    try {
      await apiService.organization.switchOrganization(organizationId);
      // Refresh session to get updated context
      window.location.reload(); // Simple approach, or you can call refresh()
    } catch (error) {
      console.error("Failed to switch organization:", error);
      throw error;
    }
  }, []);

  return {
    currentOrganizationId,
    currentMemberRole,
    organizationMemberships,
    hasOrganization,
    isOwner,
    isOrganizationReviewer,
    isOrganizationMember,
    isLoading,
    switchOrganization,
  };
}

/**
 * Hook to check if user is authenticated
 */
export function useAuth() {
  const { data, isLoading, signOut } = useSession();

  return {
    isAuthenticated: !!data?.user,
    user: data?.user || null,
    isLoading,
    signOut,
  };
}

/**
 * Hook for protected routes - redirects if not authenticated
 */
export function useProtectedRoute(redirectUrl = "/login") {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter(); // You'll need to import from next/navigation

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, redirectUrl, router]);

  return { isAuthenticated, isLoading };
}