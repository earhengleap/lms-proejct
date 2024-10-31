// app/api/quizz/manual/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
      const { userId } = auth();
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      const { courseId, chapterId, name, description, questions, quizId, type } = await req.json();
  
      if (!courseId || !chapterId || !name || !questions || questions.length === 0) {
        return new NextResponse("Missing required fields", { status: 400 });
      }
  
      let quiz;
  
      if (quizId) {
        quiz = await db.quiz.update({
          where: { 
            id: parseInt(quizId),
            type: "manual" 
          },
          data: {
            name,
            description,
            userId,
            questions: {
              deleteMany: {},
              create: questions.map((q: any) => ({
                questionText: q.questionText,
                answers: {
                  create: q.answers.map((a: any) => ({
                    answerText: a.answerText,
                    isCorrect: a.isCorrect,
                  })),
                },
              })),
            },
          },
          include: {
            questions: {
              include: {
                answers: true,
              },
            },
          },
        });
      } else {
        quiz = await db.quiz.create({
          data: {
            name,
            description,
            type: "manual",
            courseId,
            chapterId,
            userId,
            questions: {
              create: questions.map((q: any) => ({
                questionText: q.questionText,
                answers: {
                  create: q.answers.map((a: any) => ({
                    answerText: a.answerText,
                    isCorrect: a.isCorrect,
                  })),
                },
              })),
            },
          },
          include: {
            questions: {
              include: {
                answers: true,
              },
            },
          },
        });
      }
  
      return NextResponse.json(quiz);
    } catch (error) {
      console.error("[MANUAL_QUIZ_ERROR]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
}