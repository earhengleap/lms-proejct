import { db } from "@/lib/db";

export const getQuizzes = async (chapterId: string) => {
  try {
    const quizzes = await db.quiz.findMany({
      where: {
        chapterId: chapterId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return quizzes;
  } catch (error) {
    console.error("[GET_QUIZZES]", error);
    return [];
  }
};