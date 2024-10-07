import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { QuizzRecord } from "./_components/quizz-record";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react"; // Make sure to install lucide-react if you haven't
import Link from "next/link";

const QuizzDashboard = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  // Fetch the user's courses (in-progress and completed)
  const { completedCourses, coursesInProgress } =
    await getDashboardCourses(userId);

  // Dynamically determine the courseId and chapterId
  const courseId = coursesInProgress[0]?.id || completedCourses[0]?.id || "";
  const chapterId =
    coursesInProgress[0]?.chapters[0]?.id ||
    completedCourses[0]?.chapters[0]?.id ||
    "";

  if (!courseId || !chapterId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <ClipboardList className="w-16 h-16 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Quizzes Available</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          It looks like you haven&apos;t started any courses with quizzes yet.
          Explore our courses to find exciting quizzes and test your knowledge!
        </p>
        <Link href="/search">
          <Button size="lg" className="font-semibold">
            Explore Courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <QuizzRecord courseId={courseId} chapterId={chapterId} />
    </div>
  );
};

export default QuizzDashboard;
