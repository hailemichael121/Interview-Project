import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll();

  return NextResponse.json({
    cookies: cookies.map((c) => ({ name: c.name, value: c.value })),
    headers: Object.fromEntries(request.headers.entries()),
  });
}
