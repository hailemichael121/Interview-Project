// lib/auth-client.ts - Updated with debugging
"use client";

import { createAuthClient } from "better-auth/react";

// Determine if we're in development or production
const isDev = process.env.NODE_ENV === "development";
const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";

// Use different config for dev vs prod
const authClient = createAuthClient({
  // In dev, use proxy; in prod, use direct backend
  baseURL: isDev ? "" : process.env.NEXT_PUBLIC_BACKEND_URL || "https://tenant-backend-cz23.onrender.com",
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
  session: {
    cookie: {
      // Backend uses __Secure-better-auth.session_token
      name: "__Secure-better-auth.session_token",
      secure: !isLocal, // Secure only in production
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    },
  },
});

// Add debugging helper
if (typeof window !== "undefined") {
  // @ts-ignore - Add to window for debugging
  window.authClient = authClient;
  
  // Debug session
  authClient.getSession().then(session => {
    console.log("📋 Initial session check:", session);
    if (!session?.data?.user) {
      console.log("⚠️ No session found, checking cookies...");
      console.log("Cookies:", document.cookie);
    }
  }).catch(err => {
    console.error("Session check error:", err);
  });
}

export default authClient;