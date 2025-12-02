// lib/auth-client.ts 
"use client";

import { createAuthClient } from "better-auth/react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://tenant-backend-cz23.onrender.com";

 export const authClient = createAuthClient({
  baseURL: backendUrl,  
  basePath: "/api/auth", 
  fetchOptions: {
    credentials: "include",  
  },
});

export default authClient;