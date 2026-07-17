import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdministrator } from "@/lib/administrator";
import { Badge } from "@/components/ui/badge";
import {
  UserCheck,
  Users,
  BookOpen,
  Trash,
  Wallet,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import { db } from "@/lib/db";
import { DeletionRequestList } from "./_components/deletion-request-list";
import { RecentActivities } from "./_components/recent-activities";
import { WithdrawalRequests } from "./_components/withdrawl-requests";
import { TransactionHistory } from "./_components/transaction-history";
import { format } from "date-fns";
import { AdminAnalytics } from "./_components/admin-analytics";
import { AdminStat } from "./_components/admin-stat";
import ExportButton from "./_components/export-button";

const AdministratorPage = async () => {
  const { userId } = auth();

  if (!userId || !(await isAdministrator(userId))) {
    redirect("/");
  }

  const analyticsData = {
    revenue: {
      daily: await db.purchase
        .groupBy({
          by: ["createdAt"],
          _sum: { amount: true },
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
            paymentStatus: "completed",
          },
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
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
            paymentStatus: "completed",
          },
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
      include: { publisher: true, bankAccount: true },
      orderBy: { createdAt: "desc" },
    }),
    db.purchase.aggregate({ _sum: { royaltyAmount: true } }),
    Promise.all([
      db.withdrawalRequest.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          publisher: { select: { name: true } },
          bankAccount: {
            select: { bankName: true, accountNumber: true },
          },
        },
      }),
      db.purchase.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          course: { select: { title: true } },
          publisher: { select: { name: true } },
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
    <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-slate-400" />
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Platform overview, payouts and moderation queue.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {pendingWithdrawals > 0 && (
            <Badge className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 font-medium">
              {pendingWithdrawals} Pending Payouts
            </Badge>
          )}
          {pendingDeletionRequests > 0 && (
            <Badge className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 font-medium">
              {pendingDeletionRequests} Pending Deletions
            </Badge>
          )}
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
            logoPath="/main-logo.png"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <AdminStat
          icon={UserCheck}
          title="Pending Apps"
          value={pendingApplications}
        />
        <AdminStat icon={Users} title="Educators" value={totalEducators} />
        <AdminStat icon={BookOpen} title="Courses" value={totalCourses} />
        <AdminStat
          icon={Trash}
          title="Deletions"
          value={pendingDeletionRequests}
        />
        <AdminStat
          icon={Wallet}
          title="Payouts"
          value={pendingWithdrawals}
        />
        <AdminStat
          icon={DollarSign}
          title="Royalties"
          value={totalRoyalties._sum.royaltyAmount || 0}
          shouldFormat
          emphasis
        />
      </div>

      {/* Analytics */}
      <section>
        <AdminAnalytics data={analyticsData} />
      </section>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Withdrawal Requests */}
          <section className="bg-white rounded-2xl border border-slate-200/70">
            <div className="flex items-center gap-2.5 p-5 border-b border-slate-100">
              <Wallet className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                Withdrawal Requests
              </h2>
              {pendingWithdrawals > 0 && (
                <Badge className="ml-auto px-2 py-0.5 bg-amber-50 text-amber-700 text-xs">
                  {pendingWithdrawals} pending
                </Badge>
              )}
            </div>
            <div className="p-5">
              <WithdrawalRequests initialRequests={withdrawalRequests} />
            </div>
          </section>

          {/* Transaction History */}
          <section className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
            <TransactionHistory initialTransactions={transactions} />
          </section>
        </div>

        {/* Sidebar column */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Deletion Requests */}
          <section className="bg-white rounded-2xl border border-slate-200/70">
            <div className="flex items-center gap-2.5 p-5 border-b border-slate-100">
              <Trash className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                Deletion Requests
              </h2>
              {pendingDeletionRequests > 0 && (
                <Badge className="ml-auto px-2 py-0.5 bg-rose-50 text-rose-700 text-xs">
                  {pendingDeletionRequests} pending
                </Badge>
              )}
            </div>
            <div className="p-5">
              <DeletionRequestList />
            </div>
          </section>

          {/* Recent Activities */}
          <section className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
            <RecentActivities />
          </section>
        </aside>
      </div>
    </div>
  );
};

export default AdministratorPage;
