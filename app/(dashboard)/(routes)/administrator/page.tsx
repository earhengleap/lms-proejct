// app/(dashboard)/(routes)/administrator/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdministrator } from "@/lib/administrator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserCheck,
  Users,
  BookOpen,
  Trash,
  Wallet,
  DollarSign,
} from "lucide-react";
import { db } from "@/lib/db";
import { DeletionRequestList } from "./_components/deletion-request-list";
import { RecentActivities } from "./_components/recent-activities";
import { WithdrawalRequests } from "./_components/withdrawl-requests";
import { TransactionHistory } from "./_components/transaction-history";
import { format } from "date-fns";
import { AdminAnalytics } from "./_components/admin-analytics";
import ExportButton from "./_components/export-button"; // Import the ExportButton component

const AdministratorPage = async () => {
  const { userId } = auth();

  if (!userId || !(await isAdministrator(userId))) {
    redirect("/");
  }

  // Add analytics data fetching
  const analyticsData = {
    revenue: {
      daily: await db.purchase
        .groupBy({
          by: ["createdAt"],
          _sum: {
            amount: true,
          },
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
            paymentStatus: "completed",
          },
          orderBy: {
            createdAt: "asc",
          },
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
          _sum: {
            amount: true,
          },
          where: {
            paymentStatus: "completed",
          },
          orderBy: {
            createdAt: "asc",
          },
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
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
            paymentStatus: "completed",
          },
          orderBy: {
            createdAt: "asc",
          },
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
          where: {
            paymentStatus: "completed",
          },
          orderBy: {
            createdAt: "asc",
          },
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
        _sum: {
          price: true,
        },
        where: {
          isPublished: true,
        },
      })
      .then(async (data) => {
        const categories = await db.category.findMany();
        return data
          .filter((d) => d.categoryId) // Filter out null categories
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
    totalCourses,
    pendingApplications,
    totalEducators,
    pendingDeletionRequests,
    pendingWithdrawals,
    withdrawalRequests,
    totalRoyalties,
    transactions,
  ] = await Promise.all([
    db.course.count(),
    db.user.count({ where: { isInstructor: false } }),
    db.user.count({ where: { isInstructor: true } }),
    db.deletionRequest.count({ where: { status: "pending" } }),
    db.withdrawalRequest.count({ where: { status: "pending" } }),
    db.withdrawalRequest.findMany({
      where: { status: "pending" },
      include: {
        publisher: true,
        bankAccount: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.purchase.aggregate({ _sum: { royaltyAmount: true } }),
    // Fetch combined transactions
    Promise.all([
      // Fetch withdrawals
      db.withdrawalRequest.findMany({
        take: 50,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          publisher: {
            select: {
              name: true,
            },
          },
          bankAccount: {
            select: {
              bankName: true,
              accountNumber: true,
            },
          },
        },
      }),
      // Fetch purchases
      db.purchase.findMany({
        take: 50,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          course: {
            select: {
              title: true,
            },
          },
          publisher: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]).then(([withdrawals, purchases]) => {
      const formattedWithdrawals = withdrawals.map((w) => ({
        id: w.id,
        type: "withdrawal" as const,
        amount: w.amount,
        status: w.status,
        createdAt: w.createdAt,
        publisher: w.publisher,
        bankAccount: w.bankAccount,
      }));

      const formattedPurchases = purchases.map((p) => ({
        id: p.id,
        type: "purchase" as const,
        amount: p.amount,
        status: p.paymentStatus,
        createdAt: p.createdAt,
        publisher: p.publisher,
        course: p.course,
      }));

      return [...formattedWithdrawals, ...formattedPurchases].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    }),
  ]);

  return (
    <main className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Administrator Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {pendingWithdrawals > 0 && (
              <Badge className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200">
                {pendingWithdrawals} Pending Withdrawals
              </Badge>
            )}
            {pendingDeletionRequests > 0 && (
              <Badge className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200">
                {pendingDeletionRequests} Pending Deletions
              </Badge>
            )}
          </div>
          {/* Export Button */}
          <ExportButton
            data={{
              chartData: analyticsData.revenue.monthly,
              totalRevenue: totalRoyalties._sum.royaltyAmount || 0,
              totalSales: analyticsData.purchases.monthly.reduce(
                (sum, p) => sum + p.count,
                0
              ),
              studentDemographics: analyticsData.categoryDistribution,
            }}
            fileName="Analytics_Report"
            logoPath="/main-logo.png" // Replace with the actual logo path
          />
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon={UserCheck}
            title="Pending Applications"
            value={pendingApplications}
            color="text-blue-600"
            bgColor="bg-blue-50"
            borderColor="border-blue-100"
          />
          <StatCard
            icon={Users}
            title="Total Educators"
            value={totalEducators}
            color="text-indigo-600"
            bgColor="bg-indigo-50"
            borderColor="border-indigo-100"
          />
          <StatCard
            icon={BookOpen}
            title="Total Courses"
            value={totalCourses}
            color="text-purple-600"
            bgColor="bg-purple-50"
            borderColor="border-purple-100"
          />
          <StatCard
            icon={Trash}
            title="Pending Deletions"
            value={pendingDeletionRequests}
            color="text-red-600"
            bgColor="bg-red-50"
            borderColor="border-red-100"
          />
          <StatCard
            icon={Wallet}
            title="Pending Withdrawals"
            value={pendingWithdrawals}
            color="text-green-600"
            bgColor="bg-green-50"
            borderColor="border-green-100"
          />
          <StatCard
            icon={DollarSign}
            title="Total Royalties"
            value={totalRoyalties._sum.royaltyAmount || 0}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
            borderColor="border-yellow-100"
          />
        </section>

        {/* Analytics Section - New */}
        <section className="mb-8">
          <AdminAnalytics data={analyticsData} />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main Content Column */}
          <section className="xl:col-span-8 space-y-6">
            {/* Withdrawal Requests */}
            <Card className="border rounded-lg shadow-sm bg-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50">
                      <Wallet className="h-5 w-5 text-green-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Withdrawal Requests
                    </h2>
                  </div>
                  {pendingWithdrawals > 0 && (
                    <Badge className="px-2.5 py-1 bg-green-50 text-green-700">
                      {pendingWithdrawals} pending
                    </Badge>
                  )}
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <WithdrawalRequests initialRequests={withdrawalRequests} />
                </div>
              </div>
            </Card>

            {/* Transaction History */}
            <Card className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <TransactionHistory initialTransactions={transactions} />
            </Card>
          </section>

          {/* Sidebar Column */}
          <aside className="xl:col-span-4 space-y-6">
            {/* Deletion Requests */}
            <Card className="border rounded-lg shadow-sm bg-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-50">
                      <Trash className="h-5 w-5 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Deletion Requests
                    </h2>
                  </div>
                  {pendingDeletionRequests > 0 && (
                    <Badge className="px-2.5 py-1 bg-red-50 text-red-700">
                      {pendingDeletionRequests} pending
                    </Badge>
                  )}
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <DeletionRequestList />
                </div>
              </div>
            </Card>

            {/* Recent Activities */}
            <Card className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <RecentActivities />
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
};

interface StatCardProps {
  icon: any;
  title: string;
  value: number;
  color?: string;
  bgColor?: string;
  borderColor?: string;
}

const StatCard = ({
  icon: Icon,
  title,
  value,
  color,
  bgColor,
  borderColor,
}: StatCardProps) => (
  <Card
    className={`group transition-all duration-300 hover:shadow-lg border ${borderColor} bg-white overflow-hidden`}
  >
    <div className="p-6">
      <div className="flex items-start gap-4">
        <div
          className={`p-2 rounded-lg ${bgColor} group-hover:scale-110 transition-transform`}
        >
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  </Card>
);

export default AdministratorPage;

//OLD CODE