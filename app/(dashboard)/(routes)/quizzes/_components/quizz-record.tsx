import React from "react";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import getUserMetrics from "@/actions/get-user-metrics";
import getHeatMapData, { HeatMapDataPoint } from "@/actions/get-heat-map-data";
import UserHeatMap from "@/components/heat-map";
import MetricCard from "@/components/ui/metric-card";
import QuizzCard from "./quizz-card";

const prisma = new PrismaClient();

interface QuizzRecordProps {
  courseId?: string;
  chapterId?: string;
}

interface CourseQuizSummary {
  courseId: string;
  courseTitle: string;
  courseImageUrl: string;
  quizCount: number;
  totalScore: number;
  category: string; // This will store the category name
}

export const QuizzRecord = async ({
  courseId,
  chapterId,
}: QuizzRecordProps) => {
  const { userId } = auth();

  if (!userId) {
    return <div>User not found</div>;
  }

  // Fetch all quizzes for the user with scores
  const userQuizzes = await prisma.quizSubmission.findMany({
    where: {
      userId: userId,
    },
    include: {
      quiz: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              imageUrl: true,
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Group quizzes by course
  const courseQuizzes = userQuizzes.reduce(
    (acc, submission) => {
      const courseId = submission.quiz.course.id;
      if (!acc[courseId]) {
        acc[courseId] = {
          courseId: courseId,
          courseTitle: submission.quiz.course.title,
          courseImageUrl:
            submission.quiz.course.imageUrl || "/placeholder-image.jpg",
          quizCount: 0,
          totalScore: 0,
          category:
            typeof submission.quiz.course.category === "object" &&
            submission.quiz.course.category !== null
              ? submission.quiz.course.category.name
              : typeof submission.quiz.course.category === "string"
                ? submission.quiz.course.category
                : "Uncategorized",
        };
      }
      acc[courseId].quizCount += 1;
      acc[courseId].totalScore += submission.score;
      return acc;
    },
    {} as Record<string, CourseQuizSummary>
  );

  const userData = await getUserMetrics();
  const heatMapData: HeatMapDataPoint[] = await getHeatMapData();

  return (
    <div className="space-y-6">
      {/* User Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {userData && userData.length > 0
          ? userData
              .filter(
                (metric) =>
                  metric.label === "Number of Submissions" ||
                  metric.label === "Average Score"
              )
              .map((metric) => (
                <MetricCard
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                />
              ))
          : null}
      </div>

      {/* HeatMap */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Quiz Submission Activity
        </h2>
        <div className="w-full h-64 flex items-center justify-center">
          {heatMapData && heatMapData.length > 0 ? (
            <UserHeatMap data={heatMapData} />
          ) : (
            <p className="text-gray-500 text-center font-medium">
              No activity data available.
            </p>
          )}
        </div>
      </div>

      {/* Quizzes Cards */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Quiz Submissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(courseQuizzes).map((course) => (
            <QuizzCard
              key={course.courseId}
              courseId={course.courseId}
              courseTitle={course.courseTitle}
              courseImageUrl={course.courseImageUrl}
              quizCount={course.quizCount}
              averageScore={course.totalScore / course.quizCount}
              category={course.category}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizzRecord;
