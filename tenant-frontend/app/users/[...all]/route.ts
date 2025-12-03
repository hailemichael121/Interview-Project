// app/api/users/[...all]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://tenant-backend-cz23.onrender.com";

async function proxyRequest(
  request: NextRequest,
  path: string,
  method: string
) {
  const url = `${BACKEND_URL}/users/${path}`;

  const requestCookies = request.cookies.toString();
  const requestOrigin =
    request.headers.get("origin") || "https://tenanncy.onrender.com";

  const headers: Record<string, string> = {
    Origin: requestOrigin,
    Cookie: requestCookies,
  };

  if (method !== "GET") {
    headers["Content-Type"] = "application/json";
  }

  const init: RequestInit = {
    method,
    headers,
  };

  if (method !== "GET" && method !== "HEAD") {
    try {
      const body = await request.json();
      init.body = JSON.stringify(body);
    } catch {
      // No body
    }
  }

  const response = await fetch(url, init);
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
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.all.join("/");
  return proxyRequest(request, path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.all.join("/");
  return proxyRequest(request, path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.all.join("/");
  return proxyRequest(request, path, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.all.join("/");
  return proxyRequest(request, path, "DELETE");
}
