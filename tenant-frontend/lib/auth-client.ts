// lib/auth-client.ts - UPDATED WITH DEBUGGING
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
  session: {
    cookie: {
      name: "better-auth.session_token",
      sameSite: "none",
      secure: true,
      httpOnly: false,
    },
  },
});

export const checkAuthStatus = async () => {
  try {
    const session = await authClient.getSession();
    console.log("Session check result:", session);

    const cookies = document.cookie;
    console.log("Browser cookies:", cookies);

    const response = await fetch(`${backendUrl}/api/auth/get-session`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Manual session fetch:", await response.json());
    console.log("Response headers:", response.headers.get("set-cookie"));

    return session;
  } catch (error) {
    console.error("Auth check failed:", error);
    return null;
  }
};

export default authClient;
