// lib/auth-client.ts - UPDATED
import { createAuthClient } from "better-auth/react";
// import { admin } from "better-auth/plugins";

export const authClient = createAuthClient({
  baseURL: "https://tenant-backend-cz23.onrender.com", // Keep backend URL
  basePath: "/api/auth", // This is correct
  fetchOptions: {
    credentials: "include",
  },
  session: {
    cookie: {
      name: "__Secure-better-auth.session_token",
      secure: true,
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    },
  },
});

export default authClient;
