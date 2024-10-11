// app/(dashboard)/(route)/administrator/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdministrator } from "@/lib/administrator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Users, BookOpen } from "lucide-react";
import { db } from "@/lib/db";

const AdministratorPage = async () => {
  const { userId } = auth();

  if (!userId || !(await isAdministrator(userId))) {
    redirect("/");
  }

  // Fetch the total number of courses from the database
  const totalCourses = await db.course.count();

  // TODO: Replace these with actual data fetching for other values
  const pendingApplications = 1;
  const totalEducators = 2;

  const recentActivities = [
    { type: "Application", description: "New educator application: Dara Chan" },
    { type: "Application", description: "New educator application: Dara Chan" },
    { type: "Withdrawal", description: "New withdrawal request: $100" },
    { type: "Course", description: "New course created: Java" },
    { type: "Withdrawal", description: "New withdrawal request: $5" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Administrator Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={UserCheck}
          title="Pending Applications"
          value={pendingApplications}
        />
        <StatCard icon={Users} title="Total Educators" value={totalEducators} />
        <StatCard icon={BookOpen} title="Total Courses" value={totalCourses} />
      </div>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
        <ul className="space-y-2">
          {recentActivities.map((activity, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>{activity.description}</span>
              <ActivityBadge type={activity.type} />
            </li>
          ))}
        </ul>
      </Card>
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

const ActivityBadge = ({ type }: { type: string }) => {
  const colors = {
    Application: "bg-purple-100 text-purple-800",
    Withdrawal: "bg-blue-100 text-blue-800",
    Course: "bg-green-100 text-green-800",
  };
  return (
    <Badge className={`${colors[type as keyof typeof colors]} px-2 py-1`}>
      {type}
    </Badge>
  );
};

export default AdministratorPage;
