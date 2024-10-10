// app/(dashboard)/(routes)/quizzes/submissions/courses/[courseId]/chapters/[chapterId]/page.tsx

import React from "react";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

interface QuizSubmissionDetailPageProps {
  params: {
    submissionId: string;
  };
}


const QuizSubmissionDetailPage = async ({
  params,
}: QuizSubmissionDetailPageProps) => {
  const { userId } = auth();
  const { submissionId } = params;

  if (!userId) {
    redirect("/");
  }

  if (!submissionId) {
    return <div>Submission ID is missing</div>;
  }

  const submission = await db.quizSubmission.findUnique({
    where: {
      id: parseInt(submissionId),
      userId: userId,
    },
    include: {
      quiz: {
        include: {
          questions: {
            include: {
              answers: true,
            },
          },
        },
      },
    },
  });

  if (!submission) {
    return <div>Submission not found</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Quiz Submission: {submission.quiz.name}
      </h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <Badge variant="secondary">Score: {submission.score}%</Badge>
            <p className="text-sm text-gray-500">
              Submitted on: {new Date(submission.createdAt).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-6">
        {submission.quiz.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {index + 1}: {question.questionText}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6">
                {question.answers.map((answer) => (
                  <li
                    key={answer.id}
                    className={`${
                      answer.isCorrect ? "text-green-600 font-semibold" : ""
                    }`}
                  >
                    {answer.answerText}
                    {answer.isCorrect && " (Correct)"}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuizSubmissionDetailPage;
