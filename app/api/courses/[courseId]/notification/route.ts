// app/api/courses/[courseId]/notification/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const deletionRequest = await db.deletionRequest.findFirst({
      where: {
        itemId: params.courseId,
        userId: userId,
        type: "course",
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (deletionRequest && deletionRequest.status !== 'pending') {
      const message = deletionRequest.status === 'approved'
        ? "Your course deletion request has been approved. The course will be deleted shortly."
        : "Your course deletion request has been rejected. The course will remain active.";

      // Delete the notification after sending it
      await db.deletionRequest.delete({
        where: { id: deletionRequest.id }
      });

      return NextResponse.json({ message });
    }

    return NextResponse.json({ message: null });
  } catch (error) {
    console.log("[COURSE_NOTIFICATION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

//old