import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { WalletStat } from "./_components/wallet-stat";
import { getWalletData } from "@/actions/get-wallet-data";
import WithdrawalDialog from "./_components/withdrawl-dialog";
import {
  DollarSign,
  CreditCard,
  Clock,
  TrendingUp,
  Award,
  ArrowDownToLine,
  Wallet,
} from "lucide-react";

const WalletPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const {
    totalRevenue,
    instructorRevenue,
    royalty,
    availableBalance,
    pendingBalance,
    withdrawnRevenue,
    transactions,
    publisherId,
  } = await getWalletData(userId);

  const showWithdrawalOptions = publisherId !== null && availableBalance > 0;

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Wallet
        </h1>
        <p className="text-sm text-slate-500">
          Your earnings, balance and payout history.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <WalletStat
          label="Available Balance"
          value={availableBalance}
          shouldFormat
          description="Ready to withdraw"
          icon={<DollarSign className="h-4 w-4" />}
          emphasis
        />
        <WalletStat
          label="Pending Balance"
          value={pendingBalance}
          shouldFormat
          description="Clears in a few days"
          icon={<Clock className="h-4 w-4" />}
        />
        <WalletStat
          label="Withdrawn"
          value={withdrawnRevenue}
          shouldFormat
          description="Total paid out"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <WalletStat
          label="Total Revenue"
          value={totalRevenue}
          shouldFormat
          description="Gross earnings"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <WalletStat
          label="Instructor Revenue"
          value={instructorRevenue}
          shouldFormat
          description="After 10% royalty"
          icon={<Wallet className="h-4 w-4" />}
        />
        <WalletStat
          label="Royalty Deducted"
          value={royalty}
          shouldFormat
          description="10% platform fee"
          icon={<Award className="h-4 w-4" />}
        />
      </div>

      {/* Withdrawal */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <CreditCard className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Payouts
          </h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6">
          {showWithdrawalOptions ? (
            <WithdrawalDialog
              availableBalance={availableBalance}
              publisherId={publisherId}
            />
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <CreditCard className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  No payout available
                </p>
                <p className="text-sm text-slate-500 mt-0.5 max-w-md">
                  {!publisherId
                    ? "Set up your publisher account to enable withdrawals."
                    : "You need an available balance to make a withdrawal."}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Transactions */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <Clock className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Recent Transactions
          </h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/70 divide-y divide-slate-100">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between px-5 py-3.5 first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      transaction.amount > 0
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {transaction.amount > 0 ? (
                      <ArrowDownToLine className="h-4 w-4" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-slate-400">{transaction.date}</p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    transaction.amount > 0
                      ? "text-emerald-600"
                      : "text-slate-700"
                  }`}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount.toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-14">
              <p className="text-sm font-medium text-slate-700">
                No transactions yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Your payout history will show up here.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default WalletPage;
