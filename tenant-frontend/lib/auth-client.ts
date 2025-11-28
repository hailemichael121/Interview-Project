// lib/auth-client.ts
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
const mode = (process.env.NEXT_PUBLIC_APP_MODE || process.env.NODE_ENV || "production").toString().toLowerCase();
const isDevEnv = mode === "development" || mode === "dev";

// Runtime toggle key for mock auth
const MOCK_TOGGLE_KEY = "use-mock-auth";
const DEV_EMAIL = "test@gmail.com";
const DEV_PASSWORD = "123456";

function isMockActiveAtRuntime() {
  if (typeof window === "undefined") return false;
  // If environment is not dev, don't enable mock
  if (!isDevEnv) return false;
  const v = localStorage.getItem(MOCK_TOGGLE_KEY);
  if (v === null) return true; // default to true in dev
  return v === "true";
}

// helper to set toggle
export function setUseMockAuth(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOCK_TOGGLE_KEY, enabled ? "true" : "false");
  // no automatic reload here; caller may reload to apply
}

// Build a mock client (strict credentials)
const mockAuthClient: any = {
  signIn: {
    email: async (
      payload: { email: string; password: string },
      opts?: { onSuccess?: () => void; onError?: (ctx: any) => void }
    ) => {
      await new Promise((r) => setTimeout(r, 300));
      // strict check
      if (payload.email !== DEV_EMAIL || payload.password !== DEV_PASSWORD) {
        const err = { message: "Invalid demo credentials" };
        opts?.onError?.({ error: err });
        return { data: null, error: err };
      }
      const token = "mock-token";
      try {
        localStorage.setItem("mock-token", token);
        localStorage.setItem("mock-user", JSON.stringify({ id: "1", name: "Dev User", email: payload.email }));
        opts?.onSuccess?.();
        return { data: { user: { id: "1", name: "Dev User", email: payload.email }, session: { token } }, error: null };
      } catch (e: any) {
        opts?.onError?.({ error: { message: e?.message || String(e) } });
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },
  },

  signUp: {
    email: async (
      payload: { name?: string; email: string; password: string },
      opts?: { onSuccess?: () => void; onError?: (ctx: any) => void }
    ) => {
      await new Promise((r) => setTimeout(r, 300));
      // For strictness, only allow the demo credentials to sign up in dev
      if (payload.email !== DEV_EMAIL || payload.password !== DEV_PASSWORD) {
        const err = { message: "Demo sign up only allowed for demo credentials" };
        opts?.onError?.({ error: err });
        return { data: null, error: err };
      }
      const token = "mock-token";
      localStorage.setItem("mock-token", token);
      localStorage.setItem("mock-user", JSON.stringify({ id: "1", name: payload.name || "Dev User", email: payload.email }));
      opts?.onSuccess?.();
      return { data: { user: { id: "1", name: payload.name || "Dev User", email: payload.email }, session: { token } }, error: null };
    },
  },

  getSession: async () => {
    const token = localStorage.getItem("mock-token");
    const userStr = localStorage.getItem("mock-user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        return { data: { user, session: { token } }, error: null };
      } catch {
        return { data: null, error: null };
      }
    }
    return { data: null, error: null };
  },

  signOut: async () => {
    localStorage.removeItem("mock-token");
    localStorage.removeItem("mock-user");
    localStorage.removeItem("currentOrg");
    return { data: null, error: null };
  },

  organization: {
    create: async ({ name, slug }: { name: string; slug: string }) => {
      await new Promise((r) => setTimeout(r, 200));
      const org = { id: `org-${Date.now()}`, name, slug };
      localStorage.setItem("currentOrg", JSON.stringify(org));
      return { data: { organization: org }, error: null };
    },
    acceptInvitation: async ({ invitationId }: { invitationId: string }) => {
      await new Promise((r) => setTimeout(r, 200));
      return { data: { accepted: true, invitationId }, error: null };
    },
  },

  useSession: function useSessionHook() {
    const [state, setState] = useState<{ data: any | null; isLoading: boolean }>({ data: null, isLoading: true });
    useEffect(() => {
      let mounted = true;
      (async () => {
        const res = await mockAuthClient.getSession();
        if (!mounted) return;
        setState({ data: res.data, isLoading: false });
      })();
      return () => {
        mounted = false;
      };
    }, []);
    return state;
  },
};

// seed a session for convenience if mock is active
if (typeof window !== "undefined" && isMockActiveAtRuntime()) {
  const has = localStorage.getItem("mock-token");
  if (!has) {
    localStorage.setItem("mock-token", "mock-token");
    localStorage.setItem("mock-user", JSON.stringify({ id: "1", name: "Dev User", email: DEV_EMAIL }));
  }
}

const realAuthClient = createAuthClient({
  baseURL: `${backendUrl.replace(/\/$/, "")}/api/auth`,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [organizationClient()],
});

export const authClient = isDevEnv ? mockAuthClient : realAuthClient;

// Runtime proxy: delegates to mock or real client based on the runtime toggle.
export const authClientProxy: any = {
  signIn: {
    email: async (payload: any, opts?: any) => {
      const client = isMockActiveAtRuntime() ? mockAuthClient : realAuthClient;
      return client.signIn.email(payload, opts);
    },
  },
  signUp: {
    email: async (payload: any, opts?: any) => {
      const client = isMockActiveAtRuntime() ? mockAuthClient : realAuthClient;
      return client.signUp.email(payload, opts);
    },
  },
  getSession: async () => {
    const client = isMockActiveAtRuntime() ? mockAuthClient : realAuthClient;
    return client.getSession();
  },
  signOut: async () => {
    const client = isMockActiveAtRuntime() ? mockAuthClient : realAuthClient;
    return client.signOut();
  },
  organization: {
    create: async (p: any) => {
      const client = isMockActiveAtRuntime() ? mockAuthClient : realAuthClient;
      return client.organization.create(p);
    },
    acceptInvitation: async (p: any) => {
      const client = isMockActiveAtRuntime() ? mockAuthClient : realAuthClient;
      return client.organization.acceptInvitation(p);
    },
  },
  useSession: function useSessionWrapper() {
    const [state, setState] = useState<{ data: any | null; isLoading: boolean }>({ data: null, isLoading: true });
    useEffect(() => {
      let mounted = true;
      (async () => {
        const client = isMockActiveAtRuntime() ? mockAuthClient : realAuthClient;
        if (typeof client.getSession === "function") {
          const res = await client.getSession();
          if (!mounted) return;
          setState({ data: res.data, isLoading: false });
        } else {
          setState({ data: null, isLoading: false });
        }
      })();
      return () => {
        mounted = false;
      };
    }, []);
    return state;
  },
};

// Backward compatible default export used by app code
export default authClientProxy;
