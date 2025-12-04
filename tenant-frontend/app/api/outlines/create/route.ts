// app/api/outlines/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { apiService } from "@/lib/api-service";

export async function POST(request: NextRequest) {
  try {
    const organizationId = request.headers.get("X-Organization-Id");

    if (!organizationId) {
      return NextResponse.json(
        { success: false, message: "Organization ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const response = await apiService.outline.createOutline(
      {
        ...body,
        organizationId,
      },
      organizationId
    );

    if (response.success) {
      return NextResponse.json(response, { status: 201 });
    } else {
      return NextResponse.json(response, { status: 400 });
    }
  } catch (error: unknown) {
    console.error("API Error creating outline:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
