import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://tenant-backend-cz23.onrender.com";

async function proxyRequest(
  request: NextRequest,
  path: string,
  method: string
) {
  // Construct the full backend URL
  const url = `${BACKEND_URL}/api/organization/${path}`;

  // ✅ Get ALL cookies from the incoming request and convert to a string header
  const cookieHeader = request.cookies.toString();

  // Prepare headers to forward to the backend
  const headers: Record<string, string> = {
    Cookie: cookieHeader,
    Origin: request.headers.get("origin") || "https://tenanncy.onrender.com",
  };

  // Add Content-Type for non-GET requests
  if (method !== "GET" && method !== "HEAD") {
    headers["Content-Type"] = "application/json";
  }

  const init: RequestInit = {
    method,
    headers,
  };

  // Add body for non-GET/HEAD requests
  if (method !== "GET" && method !== "HEAD") {
    try {
      const body = await request.json();
      init.body = JSON.stringify(body);
    } catch {
      // If there's no JSON body, continue without it
    }
  }

  // Forward the request to the backend
  const response = await fetch(url, init);
  const data = await response.json();

  // Create a Next.js response with the backend's data
  const nextResponse = NextResponse.json(data, {
    status: response.status,
  });

  // ✅ CRITICAL: Forward any Set-Cookie headers from the backend
  // This ensures authentication cookies are passed back to the browser
  const setCookieHeaders = response.headers.getSetCookie();
  if (setCookieHeaders && setCookieHeaders.length > 0) {
    setCookieHeaders.forEach((cookie) => {
      nextResponse.headers.append("Set-Cookie", cookie);
    });
  }

  return nextResponse;
}

// Handler for each HTTP method
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
