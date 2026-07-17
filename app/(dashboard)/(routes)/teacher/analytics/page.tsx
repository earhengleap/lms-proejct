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
  DollarSign,
  Users,
  BookOpen,
  HelpCircle,
  BarChart2,
  TrendingUp,
  Award,
  BarChart,
} from "lucide-react";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
    <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
            <BarChart className="h-4.5 w-4.5 text-sky-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Instructor Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Track your performance and revenue
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TimeRangeFilter />
          <ExportButton
            data={exportData}
            fileName="analytics_report"
            logoPath={logoPath}
          />
        </div>
      </div>

      {/* Revenue Info */}
      <div className="bg-sky-50/80 border border-sky-200/60 rounded-2xl px-5 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
          <TrendingUp className="h-4 w-4 text-sky-600" />
        </div>
        <p className="text-sm text-sky-700">
          A <span className="font-semibold">10% royalty</span> fee is deducted
          from your total revenue.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DataCard
          label="Total Revenue"
          value={totalRevenue}
          shouldFormat
          description="Before 10% Royalty"
          icon={<DollarSign className="h-4 w-4" />}
          color="emerald"
        />
        <DataCard
          label="Instructor Revenue"
          value={instructorRevenue}
          shouldFormat
          description="After 10% Royalty"
          icon={<DollarSign className="h-4 w-4" />}
          color="sky"
        />
        <DataCard
          label="Royalty Deducted"
          value={royalty}
          shouldFormat
          description="10% of Total Revenue"
          icon={<Award className="h-4 w-4" />}
          color="amber"
        />
        <DataCard
          label="Withdrawn"
          value={withdrawnRevenue}
          shouldFormat
          description="Amount Transferred"
          icon={<TrendingUp className="h-4 w-4" />}
          color="violet"
        />
        <DataCard
          label="Total Sales"
          value={totalSales}
          description="Courses Sold"
          icon={<Users className="h-4 w-4" />}
          color="indigo"
        />
        <DataCard
          label="Quizzes"
          value={numQuizzes}
          description="Created by You"
          icon={<HelpCircle className="h-4 w-4" />}
          color="rose"
        />
        <DataCard
          label="Questions"
          value={numQuestions}
          description="Across All Quizzes"
          icon={<BookOpen className="h-4 w-4" />}
          color="orange"
        />
        <DataCard
          label="Avg. Completion"
          value={averageCompletionRate}
          formatType="percent"
          description="Across All Courses"
          icon={<BarChart2 className="h-4 w-4" />}
          color="teal"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-1">
          Revenue Over Time
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Monthly revenue breakdown
        </p>
        <Chart data={chartData} />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">
            Course Performance
          </h2>
          <p className="text-sm text-slate-500 mb-5">
            Completion rates by course
          </p>
          <CoursePerformance data={completionRates} />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">
            Student Demographics
          </h2>
          <p className="text-sm text-slate-500 mb-5">
            Enrollment distribution
          </p>
          <StudentDemographics data={studentDemographics} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
