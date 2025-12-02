// app/api/auth/[...all]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://tenant-backend-cz23.onrender.com";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> } // params is now a Promise
) {
  try {
    const resolvedParams = await params; // Await the params
    const path = resolvedParams.all.join("/");
    const url = `${BACKEND_URL}/api/auth/${path}`;

    const body = await request.json();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Forward Set-Cookie headers from backend
    const responseHeaders = new Headers();
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      responseHeaders.set("set-cookie", setCookie);
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
  { params }: { params: Promise<{ all: string[] }> } // params is now a Promise
) {
  try {
    const resolvedParams = await params; // Await the params
    const path = resolvedParams.all.join("/");
    const url = `${BACKEND_URL}/api/auth/${path}`;

    // Forward cookies from client to backend
    const cookies = request.cookies.toString();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: cookies,
      },
    });

    const data = await response.json();

    // Forward Set-Cookie headers from backend to client
    const responseHeaders = new Headers();
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      responseHeaders.set("set-cookie", setCookie);
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
