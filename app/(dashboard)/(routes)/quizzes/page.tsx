import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import QuizzRecord from "./_components/quizz-record";
import { ClipboardList, Search } from "lucide-react";
import Link from "next/link";

const QuizzDashboard = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const { completedCourses, coursesInProgress } =
    await getDashboardCourses(userId);

  const courseId =
    coursesInProgress[0]?.id || completedCourses[0]?.id || "";
  const chapterId =
    coursesInProgress[0]?.chapters[0]?.id ||
    completedCourses[0]?.chapters[0]?.id ||
    "";

  if (!courseId || !chapterId) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
            <ClipboardList className="h-7 w-7 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-1.5">
            No quizzes yet
          </h2>
          <p className="text-sm text-slate-500 max-w-xs mb-6">
            Start a course with quizzes to track your progress here.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors duration-200"
          >
            <Search className="h-4 w-4" />
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Quizzes
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your quiz submissions and performance
        </p>
      </div>
      <QuizzRecord courseId={courseId} chapterId={chapterId} />
    </div>
  );
};

export default QuizzDashboard;
