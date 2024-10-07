import { getAnalytics } from "@/actions/get-analytics";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DataCard } from "./_components/data-card";
import { Chart } from "./_components/chart";
import getUserMetrics from "@/actions/get-user-metrics";

const AnalyticsPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const { data, totalRevenue, totalSales } = await getAnalytics(userId);

  const userData = await getUserMetrics();

  const numQuizzes =
    Number(
      userData?.find((metric) => metric.label === "Number of Quizzes")?.value
    ) || 0;
  const numQuestions =
    Number(
      userData?.find((metric) => metric.label === "Number of Questions")?.value
    ) || 0;

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <DataCard label="Total Revenue" value={totalRevenue} shouldFormat />
        <DataCard label="Total Sales" value={totalSales} />
        <DataCard label="Number of Quizzes" value={numQuizzes} />
        <DataCard label="Number of Questions" value={numQuestions} />
      </div>
      <Chart data={data} />
    </div>
  );
};

export default AnalyticsPage;
