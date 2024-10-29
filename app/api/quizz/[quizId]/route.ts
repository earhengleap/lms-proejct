// app/api/quizz/[quizId]/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const chapterId = searchParams.get("chapterId");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!courseId || !chapterId) {
      return new NextResponse("Course ID and Chapter ID are required", { status: 400 });
    }

    // Verify course ownership
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!course) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete the quiz and all related data
    await db.quiz.delete({
      where: {
        id: parseInt(params.quizId),
        chapterId: chapterId,
      },
    });

    return NextResponse.json({
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("[QUIZ_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}