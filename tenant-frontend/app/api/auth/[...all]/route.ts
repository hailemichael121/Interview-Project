// app/api/auth/[...all]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://tenant-backend-cz23.onrender.com";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.all.join("/");
    const url = `${BACKEND_URL}/api/auth/${path}`;

    const body = await request.json();

    const requestCookies = request.cookies.toString();

    const requestOrigin =
      request.headers.get("origin") || "https://tenanncy.onrender.com";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: requestOrigin,
        Cookie: requestCookies,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    const responseHeaders = new Headers();
    const setCookieHeaders = response.headers.getSetCookie();

    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        responseHeaders.append("Set-Cookie", cookie);
      });
    }

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Auth proxy POST error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.all.join("/");
    const url = `${BACKEND_URL}/api/auth/${path}`;

    const requestCookies = request.cookies.toString();

    const requestOrigin =
      request.headers.get("origin") || "https://tenanncy.onrender.com";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Origin: requestOrigin,
        Cookie: requestCookies,
      },
    });

    const data = await response.json();

    const responseHeaders = new Headers();
    const setCookieHeaders = response.headers.getSetCookie();

    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        responseHeaders.append("Set-Cookie", cookie);
      });
    }

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Auth proxy GET error:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    );
  }
}
