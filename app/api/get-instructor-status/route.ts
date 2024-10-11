// app/api/get-instructor-status/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { userId },
      select: { isInstructor: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ isInstructor: user.isInstructor }, { status: 200 });
  } catch (error) {
    console.error("Error fetching instructor status:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}