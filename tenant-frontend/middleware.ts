import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Ensure cookies are accessible to the frontend
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Origin",
    request.headers.get("origin") || "*"
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Organization-Id, Cookie, Authorization, Origin"
  );
  response.headers.set("Access-Control-Expose-Headers", "Set-Cookie");

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
