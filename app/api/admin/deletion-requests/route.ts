import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { isAdministrator } from "@/lib/administrator";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { type, itemId } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const deletionRequest = await db.deletionRequest.create({
      data: {
        type,
        itemId,
        userId,
        status: "pending",
      },
    });

    // Log the activity
    await db.activity.create({
      data: {
        type: "Deletion Request",
        description: `New deletion request for ${type} (ID: ${itemId})`,
        userId,
        itemId,
        itemType: type,
      },
    });

    return NextResponse.json(deletionRequest);
  } catch (error) {
    console.log("[DELETION_REQUEST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId || !(await isAdministrator(userId))) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const deletionRequests = await db.deletionRequest.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(deletionRequests);
  } catch (error) {
    console.log("[GET_DELETION_REQUESTS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = auth();
    const { id, action } = await req.json();

    if (!userId || !(await isAdministrator(userId))) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedRequest = await db.deletionRequest.update({
      where: { id },
      data: { status: action },
    });

    // Log the activity
    await db.activity.create({
      data: {
        type: "Deletion Request Action",
        description: `Deletion request ${action} for ${updatedRequest.type} (ID: ${updatedRequest.itemId})`,
        userId,
        itemId: updatedRequest.itemId,
        itemType: updatedRequest.type,
      },
    });

    if (action === "approved") {
      // Perform the actual deletion based on the request type (course or chapter)
      if (updatedRequest.type === "chapter") {
        // Delete the chapter
        await db.chapter.delete({ where: { id: updatedRequest.itemId } });
      } else if (updatedRequest.type === "course") {
        // Delete the course
        await db.course.delete({ where: { id: updatedRequest.itemId } });
      }
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.log("[UPDATE_DELETION_REQUEST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
