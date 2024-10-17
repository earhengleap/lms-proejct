//app/api/courses/[courseId]/chapters/[chapterId]/deletion-request/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the deletion request for the specific chapter
    const deletionRequest = await db.deletionRequest.findFirst({
      where: {
        itemId: params.chapterId,
        userId: userId,
        type: "chapter",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // If the deletion request is not pending, send a notification
    if (deletionRequest && deletionRequest.status !== "pending") {
      const message =
        deletionRequest.status === "approved"
          ? "Your chapter deletion request has been approved. The chapter will be deleted shortly."
          : "Your chapter deletion request has been rejected. The chapter will remain active.";

      // Delete the notification after sending it
      await db.deletionRequest.delete({
        where: { id: deletionRequest.id },
      });

      return NextResponse.json({ message });
    }

    return NextResponse.json({ message: null });
  } catch (error) {
    console.log("[CHAPTER_NOTIFICATION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
