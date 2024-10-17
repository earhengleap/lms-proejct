// app/api/courses/[courseId]/deletion-request/route.ts

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const deletionRequest = await db.deletionRequest.create({
      data: {
        type: "course",
        itemId: params.courseId,
        userId,
        status: "pending",
      },
    });

    await db.activity.create({
      data: {
        type: "DELETION_REQUEST",
        description: `Deletion request submitted for course: ${course.title}`,
        userId,
        itemId: params.courseId,
        itemType: "course",
      },
    });

    return NextResponse.json(deletionRequest);
  } catch (error) {
    console.log("[COURSE_DELETION_REQUEST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
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
        status: "pending"
      }
    });

    if (!deletionRequest) {
      return new NextResponse("Deletion request not found", { status: 404 });
    }

    await db.deletionRequest.delete({
      where: { id: deletionRequest.id }
    });

    await db.activity.create({
      data: {
        type: "DELETION_REQUEST_CANCELLED",
        description: `Deletion request cancelled for course: ${params.courseId}`,
        userId,
        itemId: params.courseId,
        itemType: "course",
      },
    });

    return new NextResponse("Deletion request cancelled successfully", { status: 200 });
  } catch (error) {
    console.log("[DELETION_REQUEST_CANCEL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

//old