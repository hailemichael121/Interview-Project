// hooks/use-auth-actions.ts - Additional helper hook
"use client";

import { useState, useCallback } from "react";
import authClient from "@/lib/auth-client";
import { apiService } from "@/lib/api-service";

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: { name?: string; image?: string }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useAuthActions(): AuthActions {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authClient.signIn.email({ email, password });
      
      if (response.error) {
        throw new Error(response.error.message || "Sign in failed");
      }
      
      // Wait a moment for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify session was created
      const session = await authClient.getSession();
      if (!session?.data?.user) {
        throw new Error("Session not created");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign in failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authClient.signUp.email({ name, email, password });
      
      if (response.error) {
        throw new Error(response.error.message || "Sign up failed");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign up failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; image?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      // Update via Better Auth
      const response = await authClient.updateUser(data);
      
      if (response.error) {
        throw new Error(response.error.message || "Update failed");
      }
      
      // Also update via our backend for consistency
      await apiService.user.updateProfile(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Update failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    signIn,
    signUp,
    updateProfile,
    isLoading,
    error,
  };
}