import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://tenant-backend-cz23.onrender.com";

export async function GET(request: NextRequest) {
  const url = `${BACKEND_URL}/users/profile`;
  const cookies = request.cookies.toString();

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: cookies,
        Origin:
          request.headers.get("origin") || "https://tenanncy.onrender.com",
      },
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      backendData: data,
      cookiesSent: cookies,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        cookiesSent: cookies,
      },
      { status: 500 }
    );
  }
}
