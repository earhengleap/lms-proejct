// app/api/quizz/[quizId]/complete/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const quiz = await db.quiz.findUnique({
      where: {
        id: parseInt(params.quizId),
      },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("[QUIZ_COMPLETE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}