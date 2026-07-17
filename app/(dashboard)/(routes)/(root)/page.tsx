import { auth } from "@clerk/nextjs/server";
import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import DashboardClient from "./_components/dashboard-client";

const Dashboard = async () => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const { completedCourses, coursesInProgress } =
    await getDashboardCourses(userId);

  const allCourses = [...coursesInProgress, ...completedCourses].map(
    (course) => ({
      ...course,
      publisherName: course.publisher?.name ?? "Unknown",
    })
  );

  return (
    <DashboardClient
      userId={userId}
      coursesInProgress={coursesInProgress.map((c) => ({
        ...c,
        publisherName: c.publisher?.name ?? "Unknown",
      }))}
      completedCourses={completedCourses.map((c) => ({
        ...c,
        publisherName: c.publisher?.name ?? "Unknown",
      }))}
    />
  );
};

export default Dashboard;
