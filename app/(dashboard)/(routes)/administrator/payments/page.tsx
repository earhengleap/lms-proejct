import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdministrator } from "@/lib/administrator";
import { db } from "@/lib/db";
import {
  CreditCard,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { AdminStat } from "../_components/admin-stat";
import { TransactionHistory } from "../_components/transaction-history";
import { WithdrawalRequests } from "../_components/withdrawl-requests";

const AdministratorPaymentsPage = async () => {
  const { userId } = auth();

  if (!userId || !(await isAdministrator(userId))) {
    redirect("/");
  }

  const [
    completedAgg,
    withdrawalAgg,
    pendingWithdrawals,
    withdrawalRequests,
    transactions,
  ] = await Promise.all([
    db.purchase.aggregate({
      _sum: { amount: true },
      where: { paymentStatus: "completed" },
    }),
    db.withdrawalRequest.aggregate({ _sum: { amount: true } }),
    db.withdrawalRequest.count({ where: { status: "pending" } }),
    db.withdrawalRequest.findMany({
      where: { status: "pending" },
      include: { publisher: true, bankAccount: true },
      orderBy: { createdAt: "desc" },
    }),
    Promise.all([
      db.withdrawalRequest.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          publisher: { select: { name: true } },
          bankAccount: { select: { bankName: true, accountNumber: true } },
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

  const totalCollected = completedAgg._sum.amount || 0;
  const totalPaidOut = withdrawalAgg._sum.amount || 0;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-slate-400" />
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Payments
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Track collections, payouts and withdrawal requests.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AdminStat
          icon={ArrowUpRight}
          title="Collected"
          value={totalCollected}
          shouldFormat
          emphasis
        />
        <AdminStat
          icon={ArrowDownLeft}
          title="Paid Out"
          value={totalPaidOut}
          shouldFormat
        />
        <AdminStat
          icon={Wallet}
          title="Pending Payouts"
          value={pendingWithdrawals}
        />
        <AdminStat
          icon={CreditCard}
          title="Net Balance"
          value={totalCollected - totalPaidOut}
          shouldFormat
        />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <section className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
            <TransactionHistory initialTransactions={transactions} />
          </section>
        </div>
        <div className="lg:col-span-5">
          <section className="bg-white rounded-2xl border border-slate-200/70">
            <div className="flex items-center gap-2.5 p-5 border-b border-slate-100">
              <Wallet className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                Withdrawal Requests
              </h2>
              {pendingWithdrawals > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                  {pendingWithdrawals} pending
                </span>
              )}
            </div>
            <div className="p-5">
              <WithdrawalRequests initialRequests={withdrawalRequests} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdministratorPaymentsPage;
