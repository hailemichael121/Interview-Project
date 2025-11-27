// lib/auth-client.ts
"use client";

import { createAuthClient } from "better-auth/react";
import { mockAuth } from "./mock-auth";

const useMockAuth =
  process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true" ||
  !process.env.NEXT_PUBLIC_BACKEND_URL;

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
});

// ──────────────────────────────────────────────────────────────
// Only override in mock mode (dev only)
// ──────────────────────────────────────────────────────────────
if (useMockAuth && typeof window !== "undefined") {
  // Sign In - Email
  authClient.signIn.email = async ({ email, password }) => {
    const result = await mockAuth.signIn(email, password);

    if (result.data?.session.token) {
      localStorage.setItem("mock-token", result.data.session.token);
    }

    // Return exact shape better-auth expects
    return {
      data: result.data
        ? {
            user: result.data.user,
            token: result.data.session.token,
            redirect: false,
          }
        : null,
      error: result.error,
      response: null as any, // required by BetterFetchResponse
    };
  };

  // Sign Up - Email
  authClient.signUp.email = async ({ email, password, name }) => {
    const result = await mockAuth.signUp(name ?? "", email, password);

    if (result.data?.session.token) {
      localStorage.setItem("mock-token", result.data.session.token);
    }

    return {
      data: result.data
        ? {
            user: result.data.user,
            token: result.data.session.token,
          }
        : { token: null, user: result.data?.user || null },
      error: result.error,
      response: null as any,
    };
  };

  // Get Session
  authClient.getSession = async () => {
    const result = await mockAuth.getSession();

    return {
      data: result.data
        ? {
            user: result.data.user,
            session: {
              ...result.data.session,
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // fake expiry
            },
          }
        : null,
      error: result.error,
      response: null as any,
    };
  };

  // Sign Out
  authClient.signOut = async () => {
    await mockAuth.signOut();
    localStorage.removeItem("mock-token");

    return {
      data: { success: true },
      error: null,
      response: null as any,
    };
  };
}
