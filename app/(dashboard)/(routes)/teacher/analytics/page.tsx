//app/(dashboard)/(routes)/teacher/analytics/page.tsx

import React from "react";
import { getAnalytics } from "@/actions/get-analytics";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DataCard } from "./_components/data-card";
import { Chart } from "./_components/chart";
import { TimeRangeFilter } from "./_components/time-range-filter";
import { CoursePerformance } from "./_components/course-performance";
import { StudentDemographics } from "./_components/student-demographics";
import { ExportButton } from "./_components/export-button";
import getUserMetrics from "@/actions/get-user-metrics";
import {
  AlertCircle,
  DollarSign,
  Users,
  BookOpen,
  HelpCircle,
  BarChart2,
  TrendingUp,
  Award,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const AnalyticsPage: React.FC = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const {
    data,
    totalRevenue,
    totalSales,
    completionRates,
    studentDemographics,
    instructorRevenue,
    withdrawnRevenue,
    royalty,
  } = await getAnalytics(userId);

  const userData = await getUserMetrics();

  const numQuizzes =
    Number(
      userData?.find((metric) => metric.label === "Number of Quizzes")?.value
    ) || 0;
  const numQuestions =
    Number(
      userData?.find((metric) => metric.label === "Number of Questions")?.value
    ) || 0;

  const averageCompletionRate =
    completionRates.reduce((acc, course) => acc + course.completionRate, 0) /
    (completionRates.length || 1);

  const chartData = data.map((item, index) => ({
    ...item,
    name: monthNames[index],
  }));

  const exportData = {
    chartData,
    totalRevenue,
    totalSales,
    completionRates,
    studentDemographics,
  };

  const logoPath = "/main-logo.png";

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Instructor Dashboard
        </h1>
        <ExportButton
          data={exportData}
          fileName="analytics_report"
          logoPath={logoPath}
        />
      </div>

      <TimeRangeFilter />

      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-700">Royalty Information</AlertTitle>
        <AlertDescription className="text-blue-600">
          A 10% royalty fee is deducted from your total revenue.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DataCard
          label="Total Revenue"
          value={totalRevenue}
          shouldFormat
          description="Before 10% Royalty"
          trend={5}
          icon={<DollarSign className="h-6 w-6" />}
          color="text-green-600"
        />
        <DataCard
          label="Instructor Revenue"
          value={instructorRevenue}
          shouldFormat
          description="After 10% Royalty"
          trend={3}
          icon={<DollarSign className="h-6 w-6" />}
          color="text-blue-600"
        />
        <DataCard
          label="Royalty Deducted"
          value={royalty}
          shouldFormat
          description="10% of Total Revenue"
          icon={<Award className="h-6 w-6" />}
          color="text-yellow-600"
        />
        <DataCard
          label="Withdrawn Revenue"
          value={withdrawnRevenue}
          shouldFormat
          description="Amount Transferred"
          icon={<TrendingUp className="h-6 w-6" />}
          color="text-purple-600"
        />
        <DataCard
          label="Total Sales"
          value={totalSales}
          description="Courses Sold"
          trend={8}
          icon={<Users className="h-6 w-6" />}
          color="text-indigo-600"
        />
        <DataCard
          label="Number of Quizzes"
          value={numQuizzes}
          description="Created by You"
          icon={<HelpCircle className="h-6 w-6" />}
          color="text-red-600"
        />
        <DataCard
          label="Number of Questions"
          value={numQuestions}
          description="Across All Quizzes"
          icon={<BookOpen className="h-6 w-6" />}
          color="text-orange-600"
        />
        <DataCard
          label="Avg. Completion Rate"
          value={averageCompletionRate}
          format={formatPercentage}
          description="Across All Courses"
          trend={2}
          icon={<BarChart2 className="h-6 w-6" />}
          color="text-teal-600"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-700">
          <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
          Revenue Over Time
        </h2>
        <Chart data={chartData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-yellow-700">
            <Award className="h-6 w-6 mr-2 text-yellow-600" />
            Course Performance
          </h2>
          <CoursePerformance data={completionRates} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-green-700">
            <Users className="h-6 w-6 mr-2 text-green-600" />
            Student Demographics
          </h2>
          <StudentDemographics data={studentDemographics} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
