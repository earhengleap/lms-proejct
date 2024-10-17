//app/api/courses/[courseId]/chapters/[chapterId]/deletion-request/route.ts

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user owns the course
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!course) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create a deletion request for the chapter
    const deletionRequest = await db.deletionRequest.create({
      data: {
        type: "chapter",
        itemId: params.chapterId,
        userId,
        status: "pending",
      },
    });

    // Log the activity
    await db.activity.create({
      data: {
        type: "DELETION_REQUEST",
        description: `Chapter deletion request submitted for chapter ID: ${params.chapterId}`,
        userId,
        itemId: params.chapterId,
        itemType: "chapter",
      },
    });

    return NextResponse.json(deletionRequest);
  } catch (error) {
    console.log("[CHAPTER_DELETION_REQUEST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if there's a pending deletion request for the chapter
    const deletionRequest = await db.deletionRequest.findFirst({
      where: {
        itemId: params.chapterId,
        userId: userId,
        type: "chapter",
        status: "pending",
      },
    });

    if (!deletionRequest) {
      return new NextResponse("Deletion request not found", { status: 404 });
    }

    // Cancel the deletion request by deleting it
    await db.deletionRequest.delete({
      where: { id: deletionRequest.id },
    });

    // Log the cancellation activity
    await db.activity.create({
      data: {
        type: "DELETION_REQUEST_CANCELLED",
        description: `Chapter deletion request cancelled for chapter ID: ${params.chapterId}`,
        userId,
        itemId: params.chapterId,
        itemType: "chapter",
      },
    });

    return new NextResponse("Deletion request cancelled successfully", { status: 200 });
  } catch (error) {
    console.log("[CHAPTER_DELETION_REQUEST_CANCEL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

