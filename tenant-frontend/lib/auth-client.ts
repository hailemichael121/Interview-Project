// lib/auth-client.ts
"use client";

import { createAuthClient } from "better-auth/react";

// Use relative path - will be proxied via next.config.js
const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
  session: {
    cookie: {
      name: "__Secure-better-auth.session_token",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    },
  },
});

export default authClient;
