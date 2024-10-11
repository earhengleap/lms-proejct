// app/api/be-instructor/route.ts

import { NextResponse } from "next/server"; // For handling responses in app directory routing
import { db } from "@/lib/db"; // Your Prisma client
import { auth } from "@clerk/nextjs/server";

// Handle POST requests
export async function POST(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Update the user's isInstructor field in the database
    const updatedUser = await db.user.update({
      where: { userId },
      data: { isInstructor: true },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
  }
}

//old