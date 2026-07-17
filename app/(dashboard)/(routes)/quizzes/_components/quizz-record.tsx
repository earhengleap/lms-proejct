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
  category: string;
}

export const QuizzRecord = async ({
  courseId,
  chapterId,
}: QuizzRecordProps) => {
  const { userId } = auth();

  if (!userId) {
    return <div>User not found</div>;
  }

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

  const courseQuizzes = userQuizzes.reduce(
    (acc, submission) => {
      const cid = submission.quiz.course.id;
      if (!acc[cid]) {
        acc[cid] = {
          courseId: cid,
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
      acc[cid].quizCount += 1;
      acc[cid].totalScore += submission.score;
      return acc;
    },
    {} as Record<string, CourseQuizSummary>
  );

  const userData = await getUserMetrics();
  const heatMapData: HeatMapDataPoint[] = await getHeatMapData();

  return (
    <div className="space-y-8">
      {/* Metrics */}
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
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Activity
        </h2>
        <div className="w-full h-64 flex items-center justify-center">
          {heatMapData && heatMapData.length > 0 ? (
            <UserHeatMap data={heatMapData} />
          ) : (
            <p className="text-sm text-slate-400 text-center">
              No activity data yet.
            </p>
          )}
        </div>
      </div>

      {/* Quiz Cards */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Quiz Submissions
        </h2>
        {Object.values(courseQuizzes).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
        ) : (
          <p className="text-sm text-slate-400 text-center py-10">
            No quiz submissions yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizzRecord;
