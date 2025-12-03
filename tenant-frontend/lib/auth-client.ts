"use client";

import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: "",
  basePath: "/api/auth",
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
