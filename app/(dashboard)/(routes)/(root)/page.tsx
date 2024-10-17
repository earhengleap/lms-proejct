// app/(dashboard)/dashboard/page.tsx

import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import CoursesList from "@/components/courses-list";
import { auth } from "@clerk/nextjs/server";
import { CircleCheck, Clock } from "lucide-react";
import { InfoCard } from "./_components/info-card";

const Dashboard = async () => {
  const { userId } = auth();

  if (!userId) {
    return null; // The RootRedirect component will handle the sign-in dialog
  }

  const { completedCourses, coursesInProgress } =
    await getDashboardCourses(userId);

  return (
    <>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard
            icon={Clock}
            label="In Progress"
            numberOfItems={coursesInProgress.length}
          />
          <InfoCard
            icon={CircleCheck}
            label="Completed"
            numberOfItems={completedCourses.length}
            variant="success"
          />
        </div>
        <CoursesList
          items={[...coursesInProgress, ...completedCourses].map((course) => ({
            ...course,
            publisherName: course.publisher?.name ?? "Unknown Publisher",
          }))}
          userId={userId}
        />
      </div>
    </>
  );
};

export default Dashboard;
