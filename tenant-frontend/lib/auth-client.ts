// lib/auth-client.ts
"use client";

import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: backendUrl,
  fetchOptions: {
    credentials: "include", // Important for cookies
  },
  plugins: [organizationClient()],
});
