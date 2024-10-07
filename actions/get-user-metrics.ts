import { PrismaClient } from '@prisma/client';
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

const getUserMetrics = async () => {
  const { userId } = auth();

  if (!userId) {
    console.log("User not found");
    return null;
  }

  try {
    // Count the total quizzes created by the user
    const numQuizzes = await prisma.quiz.count({
      where: {
        userId: userId
      }
    });

    // Count all questions related to the user's quizzes
    const numQuestions = await prisma.question.count({
      where: {
        quiz: {
          userId: userId
        }
      }
    });

    // Count all submissions made by the user
    const numSubmissions = await prisma.quizSubmission.count({
      where: {
        userId: userId
      }
    });

    // Calculate average score for all submissions made by the user
    const avgScoreResponse = await prisma.quizSubmission.aggregate({
      _avg: {
        score: true
      },
      where: {
        userId: userId
      }
    });

    const avgScore = avgScoreResponse._avg.score || 0;

    return [
      { label: "Number of Quizzes", value: numQuizzes },
      { label: "Number of Questions", value: numQuestions },
      { label: "Number of Submissions", value: numSubmissions },
      { label: "Average Score", value: avgScore.toFixed(2) }
    ];
  } catch (error) {
    console.error("Error fetching user metrics: ", error);
    return null;
  }
}

export default getUserMetrics;