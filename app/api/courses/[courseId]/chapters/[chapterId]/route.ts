// app/api/courses/[courseId]/chapters/[chapterId]/route.ts

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdministrator } from "@/lib/administrator";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user is an administrator
    const isAdmin = await isAdministrator(userId);

    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      }
    });

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    if (chapter.videoUrl) {
      const existingMuxData = await db.muxData.findUnique({
        where: {
          chapterId: params.chapterId,
        }
      });

      if (existingMuxData) {
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          },
        });
        console.log("deleted mux data", existingMuxData.id);
      }
    }

    const deletedChapter = await db.chapter.delete({
      where: {
        id: params.chapterId,
      }
    });

    const publishedChapterInCourse = await db.chapter.findMany({
      where: {
        courseId: params.courseId,
        isPublished: true,
      }
    });

    if (!publishedChapterInCourse.length) {
      await db.course.update({
        where: {
          id: params.courseId,
        },
        data: {
          isPublished: false,
        }
      });
    }

    // Delete the corresponding deletion request
    await db.deletionRequest.deleteMany({
      where: {
        itemId: params.chapterId,
        type: "chapter",
      },
    });

    // Create an activity log for the deletion
    await db.activity.create({
      data: {
        type: "CHAPTER_DELETED",
        description: `Chapter deleted: ${deletedChapter.title}`,
        userId,
        itemId: params.chapterId,
        itemType: "chapter",
      },
    });

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.log("CHAPTER_ID_DELETE", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: {
      courseId: string;
      chapterId: string;
    };
  }
) {
  try {
    const { userId } = auth();
    const { isPublished, ...values } = await req.json();

    if (!userId) {
      console.log("[USER_UNAUTHORIZED]");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!ownCourse) {
      console.log("[USER_COURSE_UNAUTHORIZED]");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      data: {
        ...values,
      },
    });

    // If a new video URL is provided, drop any stale Mux data (no longer used).
    if (values.videoUrl) {
      await db.muxData.deleteMany({
        where: {
          chapterId: params.chapterId,
        },
      });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("Internal error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}