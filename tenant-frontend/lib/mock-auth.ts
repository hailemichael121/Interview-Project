// lib/mock-auth.ts
"use client";

export const mockAuth = {
  signIn: async (email: string, password: string) => {
    // Mock successful login for any credentials
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      data: {
        user: {
          id: "1",
          name: "John Doe",
          email: email,
        },
        session: {
          token: "mock-token",
        },
      },
      error: null,
    };
  },

  signUp: async (name: string, email: string, password: string) => {
    // Mock successful signup
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      data: {
        user: {
          id: "1",
          name: name,
          email: email,
        },
        session: {
          token: "mock-token",
        },
      },
      error: null,
    };
  },

  getSession: async () => {
    // Return mock session if token exists in localStorage
    const token = localStorage.getItem("mock-token");
    if (token) {
      return {
        data: {
          user: {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
          },
          session: {
            token: token,
          },
        },
        error: null,
      };
    }
    return { data: null, error: null };
  },

  signOut: async () => {
    localStorage.removeItem("mock-token");
    localStorage.removeItem("currentOrg");
    return { data: null, error: null };
  },
};
