// components/save-to-db.tsx

import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

interface SaveQuizzData {
  name: string;
  description: string;
  courseId: string;
  chapterId: string;
  questions?: Array<{
    questionText: string;
    answers?: Array<{
      answerText: string;
      isCorrect: boolean;
    }>;
  }>;
}

export default async function saveQuizz(quizzData: SaveQuizzData) {
  const { name, description, courseId, chapterId, questions } = quizzData;

  const { userId } = auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Check if the course and chapter exist
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
      courseId: courseId,
    },
  });

  if (!chapter) {
    throw new Error("Invalid course or chapter");
  }

  try {
    // Insert the new quiz with type field
    const newQuizz = await prisma.quiz.create({
      data: {
        name,
        description,
        type: "automatic",
        userId,
        courseId,
        chapterId,
        questions: {
          create:
            questions?.map((question) => ({
              questionText: question.questionText,
              answers: {
                create:
                  question.answers?.map((answer) => ({
                    answerText: answer.answerText,
                    isCorrect: answer.isCorrect,
                  })) || [],
              },
            })) || [],
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

    return newQuizz;
  } catch (error) {
    throw error;
  }
}