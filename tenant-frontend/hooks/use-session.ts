// hooks/use-session.ts
"use client";

import { useState, useEffect } from "react";
import authClient  from "@/lib/auth-client";
import { apiService } from "@/lib/api-service";

// Define proper Better Auth session types based on error messages
interface BetterAuthSessionData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  activeOrganizationId?: string | null;
}

// The Better Auth response structure
interface BetterAuthResponse {
  data?: {
    session: BetterAuthSessionData;
    user?: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role?: string;
      emailVerified: boolean;
      banned: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
  };
  error?: any;
}

// Our app's session type
interface SessionData {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role?: string;
    emailVerified: boolean;
    banned: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  expires: string | null;
  sessionId: string | null;
}

interface UserWithContext extends SessionData {
  context?: {
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
  };
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [userWithContext, setUserWithContext] =
    useState<UserWithContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get basic session from better-auth
        const authSession =
          (await authClient.getSession()) as BetterAuthResponse;

        if (!mounted) return;

        if (!authSession || !authSession.data) {
          setSession(null);
          setUserWithContext(null);
          setIsLoading(false);
          return;
        }

        // Extract user data from Better Auth response
        // Note: Better Auth might return user separately from session
        const user = authSession.data.user || null;
        const expires =
          authSession.data.session?.expiresAt?.toISOString() || null;
        const sessionId = authSession.data.session?.id || null;

        const sessionData: SessionData = {
          user,
          expires,
          sessionId,
        };

        setSession(sessionData);

        // Only fetch additional context if we have a user
        if (sessionData.user) {
          try {
            const userData = await apiService.user.getCurrentUser();

            if (!mounted) return;

            if (userData.success) {
              setUserWithContext({
                ...sessionData,
                context: userData.data.context,
              });
            } else {
              setUserWithContext(sessionData);
            }
          } catch (contextError) {
            console.warn("Failed to fetch user context:", contextError);
            setUserWithContext(sessionData);
          }
        } else {
          setUserWithContext(sessionData);
        }
      } catch (error) {
        console.error("Session fetch error:", error);
        if (mounted) {
          setError(
            error instanceof Error ? error.message : "Failed to fetch session"
          );
          setSession(null);
          setUserWithContext(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSession();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const newSession = (await authClient.getSession()) as BetterAuthResponse;

      if (newSession?.data?.user) {
        const sessionData: SessionData = {
          user: newSession.data.user,
          expires: newSession.data.session?.expiresAt?.toISOString() || null,
          sessionId: newSession.data.session?.id || null,
        };
        setSession(sessionData);

        // Refresh context if user exists
        if (sessionData.user) {
          const userData = await apiService.user.getCurrentUser();
          if (userData.success) {
            setUserWithContext({
              ...sessionData,
              context: userData.data.context,
            });
          } else {
            setUserWithContext(sessionData);
          }
        }
      } else {
        setSession(null);
        setUserWithContext(null);
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
      setError(
        error instanceof Error ? error.message : "Failed to refresh session"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data: userWithContext || session,
    session: session,
    isLoading,
    error,
    refresh: refreshSession,
  };
}

// Hook to check if user has specific role
export function useRole() {
  const { data, isLoading } = useSession();

  const hasRole = (role: string | string[]): boolean => {
    if (!data?.user?.role) return false;

    const userRole = data.user.role.toUpperCase();
    const requiredRoles = Array.isArray(role)
      ? role.map((r) => r.toUpperCase())
      : [role.toUpperCase()];

    return requiredRoles.includes(userRole);
  };

  const isAdmin = () => hasRole(["ADMIN", "OWNER"]);
  const isReviewer = () => hasRole(["REVIEWER", "OWNER", "ADMIN"]);
  const isMember = () => hasRole(["MEMBER", "REVIEWER", "OWNER", "ADMIN"]);

  return {
    role: data?.user?.role || null,
    hasRole,
    isAdmin,
    isReviewer,
    isMember,
    isLoading,
  };
}

// Hook to check organization context
export function useOrganizationContext() {
  const { data, isLoading } = useSession();

  // Type guard to check if data has context
  const hasContext = (data: any): data is UserWithContext => {
    return data && "context" in data;
  };

  const currentOrganizationId = hasContext(data)
    ? data.context?.currentOrganizationId || null
    : null;
  const currentMemberRole = hasContext(data)
    ? data.context?.currentMemberRole || null
    : null;
  const organizationMemberships = hasContext(data)
    ? data.context?.organizationMemberships || []
    : [];

  const hasOrganization = organizationMemberships.length > 0;
  const isOwner = currentMemberRole === "OWNER";
  const isOrganizationReviewer = ["REVIEWER", "OWNER"].includes(
    currentMemberRole || ""
  );
  const isOrganizationMember = ["MEMBER", "REVIEWER", "OWNER"].includes(
    currentMemberRole || ""
  );

  return {
    currentOrganizationId,
    currentMemberRole,
    organizationMemberships,
    hasOrganization,
    isOwner,
    isOrganizationReviewer,
    isOrganizationMember,
    isLoading,
  };
}
