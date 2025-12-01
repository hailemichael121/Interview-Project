// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const publicPaths = ["/auth/signin", "/auth/signup", "/auth/verify", "/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Get the session token cookie
  const sessionToken = request.cookies.get("better-auth.session-token")?.value;

  // If trying to access protected route without session
  if (!isPublicPath && !sessionToken) {
    const signInUrl = new URL("/auth/signin", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // If trying to access auth pages with valid session, redirect to dashboard
  if (
    (pathname.startsWith("/auth/signin") ||
      pathname.startsWith("/auth/signup")) &&
    sessionToken
  ) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
