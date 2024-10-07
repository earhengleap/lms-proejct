import { db } from "@/lib/db";
import QuizzQuestions from "../_components/quizz-questions";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const QuizzIdPage = async ({
  params,
}: {
  params: {
    courseId: string;
    chapterId: string;
    quizzId: string;
  };
}) => {
  const { courseId, chapterId, quizzId } = params;
  const quizId = parseInt(quizzId);

  if (isNaN(quizId)) {
    return <div>Invalid Quiz ID</div>;
  }

  try {
    // Get the current user's ID
    const { userId } = auth();

    if (!userId) {
      return <div>You must be logged in to view this quiz.</div>;
    }

    const quiz = await db.quiz.findUnique({
      where: {
        id: quizId,
        courseId: courseId,
        chapterId: chapterId,
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
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-3xl font-bold mb-4">Quiz Not Found</h1>
          <p className="text-lg mb-6">
            The quiz you are looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      );
    }

    return (
      <div>
        <QuizzQuestions quizz={quiz} userId={userId} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return <div>Something went wrong while fetching the quiz.</div>;
  }
};

export default QuizzIdPage;
