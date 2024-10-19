//app/(dasuboard)/(routes)/administrator/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdministrator } from "@/lib/administrator";
import { Card } from "@/components/ui/card";
import { UserCheck, Users, BookOpen, Trash } from "lucide-react";
import { db } from "@/lib/db";
import { DeletionRequestList } from "./_components/deletion-request-list";
import { RecentActivities } from "./_components/recent-activities";

const AdministratorPage = async () => {
  const { userId } = auth();

  if (!userId || !(await isAdministrator(userId))) {
    redirect("/");
  }

  // Fetch all required data dynamically
  const [
    totalCourses,
    pendingApplications,
    totalEducators,
    pendingDeletionRequests,
  ] = await Promise.all([
    db.course.count(),
    db.user.count({ where: { isInstructor: false } }),
    db.user.count({ where: { isInstructor: true } }),
    db.deletionRequest.count({ where: { status: "pending" } }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Administrator Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={UserCheck}
          title="Pending Applications"
          value={pendingApplications}
        />
        <StatCard icon={Users} title="Total Educators" value={totalEducators} />
        <StatCard icon={BookOpen} title="Total Courses" value={totalCourses} />
        <StatCard
          icon={Trash}
          title="Pending Deletion Requests"
          value={pendingDeletionRequests}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">
            Pending Deletion Requests
          </h2>
          <DeletionRequestList />
        </Card>
        <RecentActivities />
      </div>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  title,
  value,
}: {
  icon: any;
  title: string;
  value: number;
}) => (
  <Card className="p-4">
    <div className="flex items-center space-x-2 mb-2">
      <Icon className="h-5 w-5 text-gray-500" />
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </Card>
);

export default AdministratorPage;
