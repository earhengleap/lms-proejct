// app/api/get-instructor-status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { userId },
      select: { isInstructor: true },
    });

    // If user is not found, assume they are not an instructor
    const isInstructor = user?.isInstructor ?? false;

    return NextResponse.json({ isInstructor }, { status: 200 });
  } catch (error) {
    console.error("Error fetching instructor status:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';