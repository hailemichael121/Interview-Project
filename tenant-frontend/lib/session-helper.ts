// lib/session-helper.ts
"use client";

export class SessionHelper {
  static getToken(): string | null {
    if (typeof window === "undefined") return null;

    // Try localStorage first
    const token = localStorage.getItem("auth_token");
    if (token) return token;

    // Try cookies
    const cookieToken = document.cookie
      .split("; ")
      .find(
        (row) =>
          row.startsWith("better-auth.session_token=") ||
          row.startsWith("__Secure-better-auth.session_token=")
      )
      ?.split("=")[1];

    return cookieToken || null;
  }

  static setToken(token: string): void {
    if (typeof window === "undefined") return;

    localStorage.setItem("auth_token", token);

    // Also set in cookies for compatibility
    const cookieValue = `${token}; path=/; max-age=604800; SameSite=Lax; Secure`;
    document.cookie = `__Secure-better-auth.session_token=${cookieValue}`;
    document.cookie = `better-auth.session_token=${cookieValue}`;
  }

  static clearToken(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    // Clear cookies
    document.cookie =
      "better-auth.session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      "__Secure-better-auth.session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }

  static getUser(): any | null {
    if (typeof window === "undefined") return null;

    const userStr = localStorage.getItem("auth_user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static setUser(user: any): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_user", JSON.stringify(user));
  }
}
