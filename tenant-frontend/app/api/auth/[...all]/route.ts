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

    const cookies = request.cookies;
    const cookieHeader = cookies.toString();

    const body = await request.json();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
        Origin:
          request.headers.get("origin") || "https://tenanncy.onrender.com",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    const nextResponse = NextResponse.json(data, {
      status: response.status,
    });

    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    }

    return nextResponse;
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

    const cookies = request.cookies;
    const cookieHeader = cookies.toString();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        Origin:
          request.headers.get("origin") || "https://tenanncy.onrender.com",
      },
    });

    const data = await response.json();

    const nextResponse = NextResponse.json(data, {
      status: response.status,
    });

    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Auth proxy GET error:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    );
  }
}
