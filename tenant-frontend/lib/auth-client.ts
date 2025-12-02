// lib/auth-client.ts
"use client";

import { createAuthClient } from "better-auth/react";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://tenant-backend-cz23.onrender.com";

export const authClient = createAuthClient({
  baseURL: backendUrl,
  basePath: "/api/auth",

  fetchOptions: {
    credentials: "include",
    mode: "cors",
  },

  // Add proper TypeScript types for storage functions
  storage: {
    getItem: (key: string) => {
      if (typeof window !== "undefined") {
        return localStorage.getItem(key);
      }
      return null;
    },
    setItem: (key: string, value: string) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, value);
      }
    },
    removeItem: (key: string) => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
    },
  },

  session: {
    cookie: {
      name: "better-auth.session_token",
      sameSite: "lax",
      secure: true,
      httpOnly: false,
      path: "/",
    },
  },
});

export const setAuthCookieManually = (token: string) => {
  if (typeof window === "undefined") return;

  const cookieValue = `${token}; path=/; max-age=604800; SameSite=Lax; Secure`;

  document.cookie = `__Secure-better-auth.session_token=${cookieValue}`;
  document.cookie = `better-auth.session_token=${cookieValue}`;

  localStorage.setItem("auth_token", token);
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

export const clearAuthToken = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");

  // Clear cookies
  const pastDate = new Date(0).toUTCString();
  document.cookie = `better-auth.session_token=; path=/; expires=${pastDate}`;
  document.cookie = `__Secure-better-auth.session_token=; path=/; expires=${pastDate}`;
};

export default authClient;
