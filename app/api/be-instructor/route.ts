// app/api/be-instructor/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if the user exists in our database
    let dbUser = await db.user.findUnique({
      where: { userId },
    });

    if (!dbUser) {
      // If the user doesn't exist, create them
      dbUser = await db.user.create({
        data: {
          userId,
          email: user.emailAddresses[0].emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    }

    // Update the user's isInstructor field
    const updatedUser = await db.user.update({
      where: { userId },
      data: { isInstructor: true },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ message: "Failed to update user", error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';