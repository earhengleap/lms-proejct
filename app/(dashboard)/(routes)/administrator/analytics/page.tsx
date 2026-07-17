import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdministrator } from "@/lib/administrator";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { BarChart2, Download } from "lucide-react";
import { AdminAnalytics } from "../_components/admin-analytics";
import { AdminStat } from "../_components/admin-stat";
import ExportButton from "../_components/export-button";
import {
  DollarSign,
  ShoppingCart,
  BookOpen,
  Users,
  TrendingUp,
  Percent,
} from "lucide-react";

const AdministratorAnalyticsPage = async () => {
  const { userId } = auth();

  if (!userId || !(await isAdministrator(userId))) {
    redirect("/");
  }

  const now = Date.now();
  const last30 = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const analyticsData = {
    revenue: {
      daily: await db.purchase
        .groupBy({
          by: ["createdAt"],
          _sum: { amount: true },
          where: { createdAt: { gte: last30 }, paymentStatus: "completed" },
          orderBy: { createdAt: "asc" },
        })
        .then((data) =>
          data.map((d) => ({
            date: format(d.createdAt, "MMM dd"),
            amount: d._sum.amount || 0,
          }))
        ),
      monthly: await db.purchase
        .groupBy({
          by: ["createdAt"],
          _sum: { amount: true },
          where: { paymentStatus: "completed" },
          orderBy: { createdAt: "asc" },
        })
        .then((data) =>
          data.map((d) => ({
            date: format(d.createdAt, "MMM yyyy"),
            amount: d._sum.amount || 0,
          }))
        ),
    },
    purchases: {
      daily: await db.purchase
        .groupBy({
          by: ["createdAt"],
          _count: true,
          where: { createdAt: { gte: last30 }, paymentStatus: "completed" },
          orderBy: { createdAt: "asc" },
        })
        .then((data) =>
          data.map((d) => ({
            date: format(d.createdAt, "MMM dd"),
            count: d._count,
          }))
        ),
      monthly: await db.purchase
        .groupBy({
          by: ["createdAt"],
          _count: true,
          where: { paymentStatus: "completed" },
          orderBy: { createdAt: "asc" },
        })
        .then((data) =>
          data.map((d) => ({
            date: format(d.createdAt, "MMM yyyy"),
            count: d._count,
          }))
        ),
    },
    categoryDistribution: await db.course
      .groupBy({
        by: ["categoryId"],
        _count: true,
        _sum: { price: true },
        where: { isPublished: true },
      })
      .then(async (data) => {
        const categories = await db.category.findMany();
        return data
          .filter((d) => d.categoryId)
          .map((d) => ({
            category:
              categories.find((c) => c.id === d.categoryId)?.name ||
              "Uncategorized",
            count: d._count,
            revenue: d._sum.price || 0,
          }));
      }),
  };

  const [
    totalRevenueAgg,
    totalSales,
    totalCourses,
    totalStudents,
    avgOrderAgg,
  ] = await Promise.all([
    db.purchase.aggregate({
      _sum: { amount: true },
      where: { paymentStatus: "completed" },
    }),
    db.purchase.count({ where: { paymentStatus: "completed" } }),
    db.course.count({ where: { isPublished: true } }),
    db.user.count(),
    db.purchase.aggregate({
      _avg: { amount: true },
      where: { paymentStatus: "completed" },
    }),
  ]);

  const totalRevenue = totalRevenueAgg._sum.amount || 0;
  const avgOrder = avgOrderAgg._avg.amount || 0;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-slate-400" />
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Analytics
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Revenue, sales and category performance across the platform.
          </p>
        </div>
        <ExportButton
          data={{
            chartData: analyticsData.revenue.monthly,
            totalRevenue,
            totalSales,
            studentDemographics: analyticsData.categoryDistribution,
          }}
          fileName="Analytics_Report"
          logoPath="/main-logo.png"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <AdminStat
          icon={DollarSign}
          title="Total Revenue"
          value={totalRevenue}
          shouldFormat
          emphasis
        />
        <AdminStat icon={ShoppingCart} title="Total Sales" value={totalSales} />
        <AdminStat icon={BookOpen} title="Courses" value={totalCourses} />
        <AdminStat icon={Users} title="Students" value={totalStudents} />
        <AdminStat
          icon={Percent}
          title="Avg. Order"
          value={avgOrder}
          shouldFormat
        />
      </div>

      {/* Charts */}
      <AdminAnalytics data={analyticsData} />
    </div>
  );
};

export default AdministratorAnalyticsPage;
