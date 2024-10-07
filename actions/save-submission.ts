'use server';

import { db } from "@/lib/db";

export async function saveSubmission(submission: { score: number, quizzId: number, userId: string }) {
  const { score, quizzId, userId } = submission;

  // Fetch the quiz to find the owner
  const quiz = await db.quiz.findUnique({
    where: { id: quizzId },
    select: { userId: true }, // Get the owner's userId
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const newSubmission = await db.quizSubmission.create({
    data: {
      score,
      quizzId,
      userId,
    },
    select: {
      id: true,
    }
  });

  // Return the submission ID and quiz owner's userId
  return {
    submissionId: newSubmission.id,
    ownerId: quiz.userId, // Return the quiz owner's userId
  };
}
