// lib/auth-client.ts - FIXED VERSION
"use client";

import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export const authClient = createAuthClient({
  baseURL: `${backendUrl}`, // Should be JUST the base URL, NOT /api/auth
  basePath: "/api/auth", // Better Auth will add this prefix
  fetchOptions: {
    credentials: "include",
  },
  plugins: [organizationClient()],
});
