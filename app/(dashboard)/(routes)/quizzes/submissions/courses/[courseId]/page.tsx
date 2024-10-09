// CourseQuizzSubmissionsPage.tsx
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ClientSideComponent from "./chapters/_components/client-quizz-submission";
import { Prisma } from "@prisma/client";

interface QuizSubmissionPageProps {
  params: {
    courseId: string;
  };
}

interface Course {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  title: string;
  courseId: string;
  description: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  videoUrl: string | null;
  position: number;
  isFree: boolean;
}

interface Quiz {
  id: string;
  name: string;
  chapterId: string;
  chapter: Chapter;
}

interface QuizSubmission {
  id: number;
  score: number;
  createdAt: Date;
  attempt: number;
  quiz: Quiz;
  userId: string;
  quizId: string;
}

const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // 1 second

const retryWithBackoff = async <T,>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES,
  backoff: number = INITIAL_BACKOFF
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (
      retries > 0 &&
      error instanceof Prisma.PrismaClientInitializationError
    ) {
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return retryWithBackoff(operation, retries - 1, backoff * 2);
    }
    throw error;
  }
};

const CourseQuizzSubmissionsPage = async ({
  params,
}: QuizSubmissionPageProps) => {
  const { userId } = auth();
  const { courseId } = params;

  if (!userId) {
    redirect("/");
  }

  if (!courseId) {
    return <div>Course ID is missing</div>;
  }

  try {
    const course = await retryWithBackoff(() =>
      db.course.findUnique({
        where: {
          id: courseId,
        },
      })
    );

    if (!course) {
      return <div>Course not found</div>;
    }

    const quizSubmissions = await retryWithBackoff(() =>
      db.quizSubmission.findMany({
        where: {
          userId: userId,
          quiz: {
            courseId: courseId,
          },
        },
        include: {
          quiz: {
            include: {
              chapter: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    );

    return (
      <ClientSideComponent
        course={course}
        quizSubmissions={quizSubmissions}
        courseId={courseId}
      />
    );
  } catch (error) {
    console.error("Database error:", error);
    return (
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
        <p>
          We&apos;re having trouble connecting to our database. Please try again
          later.
        </p>
      </div>
    );
  }
};

export default CourseQuizzSubmissionsPage;
