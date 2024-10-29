// app/api/courses/[courseId]/chapters/route.ts

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapters = await db.chapter.findMany({
      where: {
        courseId: params.courseId,
      },
      orderBy: {
        position: 'asc'
      },
      include: {
        muxData: true,
        quizzes: true,
      }
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.log("[CHAPTERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { title } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      }
    });

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const lastChapter = await db.chapter.findFirst({
      where: {
        courseId: params.courseId,
      },
      orderBy: {
        position: "desc"
      }
    });

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    const chapter = await db.chapter.create({
      data: {
        title,
        position: newPosition,
        courseId: params.courseId,
        userId: userId,
        isFree: newPosition === 1 // Still sets first chapter free by default, but can be changed later
      }
    });

    return NextResponse.json(chapter);
    
  } catch (error) {
    console.log("CHAPTERS", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}