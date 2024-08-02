import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import CourseList from "@/components/courses-list";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const { completedCourses, coursesInProgress } = await getDashboardCourses(
    userId
  );

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>{/* TODO: Info card */}</div>
        <div>{/* TODO: Info card */}</div>
      </div>
      <CourseList 
        items={[...coursesInProgress, ...completedCourses]}
      />
    </div>
  );
};
export default Dashboard;
