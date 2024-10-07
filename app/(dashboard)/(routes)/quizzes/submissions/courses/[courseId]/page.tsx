import React from "react";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Link from "next/link";

interface QuizSubmissionPageProps {
  params: {
    courseId: string;
  };
}

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

  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
  });

  if (!course) {
    return <div>Course not found</div>;
  }

  const quizSubmissions = await db.quizSubmission.findMany({
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
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {course.title} - Quiz Submissions
      </h1>
      {quizSubmissions.length === 0 ? (
        <p className="text-center text-gray-500">
          No quiz submissions found for this course.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizSubmissions.map((submission) => (
            <Link
              href={`/courses/${courseId}/chapters/${submission.quiz.chapterId}/quizz/${submission.quiz.id}`}
              key={submission.id}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {submission.quiz.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <Badge variant="secondary">
                      Score: {submission.score}%
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Chapter: {submission.quiz.chapter.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      Submitted on:{" "}
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseQuizzSubmissionsPage;
