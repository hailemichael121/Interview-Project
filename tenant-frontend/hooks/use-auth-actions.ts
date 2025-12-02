// hooks/use-auth-actions.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import authClient from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// Define types for the main hook
interface MainAuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: { name?: string; image?: string }) => Promise<void>;
  getSession: () => Promise<unknown>;
  isLoading: boolean;
  error: string | null;
}

// Define types for the simple hook (without updateProfile and getSession)
interface SimpleAuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Main hook with all features
export function useAuthActions(): MainAuthActions {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authClient.signIn.email({ email, password });

        if (response.error) {
          throw new Error(response.error.message || "Sign in failed");
        }

        // Success
        return;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Sign in failed";
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authClient.signUp.email({
          name,
          email,
          password,
        });

        if (response.error) {
          throw new Error(response.error.message || "Sign up failed");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Sign up failed");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateProfile = useCallback(
    async (data: { name?: string; image?: string }): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authClient.updateUser(data);

        if (response.error) {
          throw new Error(response.error.message || "Update failed");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Update failed");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getSession = useCallback(async (): Promise<unknown> => {
    try {
      const session = await authClient.getSession();
      return session;
    } catch (error) {
      console.error("Get session error:", error);
      return null;
    }
  }, []);

  return {
    signIn,
    signUp,
    updateProfile,
    getSession,
    isLoading,
    error,
  };
}

// Simple hook for basic auth (signin/signup only)
export function useAuthActionsSimple(): SimpleAuthActions {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authClient.signIn.email({ email, password });

        if (response.error) {
          throw new Error(response.error.message || "Sign in failed");
        }

        // Success - no session check
        return;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Sign in failed";
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authClient.signUp.email({
          name,
          email,
          password,
        });

        if (response.error) {
          throw new Error(response.error.message || "Sign up failed");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Sign up failed");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    signIn,
    signUp,
    isLoading,
    error,
  };
}

// Session check hook
export function useSessionCheck() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [user, setUser] = useState<unknown>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const session = await authClient.getSession();

        if (session?.data?.user) {
          setHasSession(true);
          setUser(session.data.user);
        } else {
          setHasSession(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setHasSession(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  return { isLoading, hasSession, user };
}
