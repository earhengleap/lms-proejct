//app/(dashboard)/(routes)/teacher/wallet/page.tsx

import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  CreditCard,
  ArrowDownToLine,
  Clock,
  TrendingUp,
  Award,
} from "lucide-react";
import { DataCard } from "../analytics/_components/data-card";
import { getWalletData } from "@/actions/get-wallet-data";
import WithdrawalDialog from "./_components/withdrawl-dialog";

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
    publisherId, // Add this to your getWalletData return type
  } = await getWalletData(userId);

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Teacher Wallet</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <DataCard
          label="Total Revenue"
          value={totalRevenue}
          shouldFormat
          description="Total earnings"
          icon={<DollarSign className="h-6 w-6" />}
          color="text-blue-600"
        />
        <DataCard
          label="Instructor Revenue"
          value={instructorRevenue}
          shouldFormat
          description="After 10% Royalty"
          icon={<DollarSign className="h-6 w-6" />}
          color="text-green-600"
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
          label="Available Balance"
          value={availableBalance}
          shouldFormat
          description="Ready to withdraw"
          icon={<DollarSign className="h-6 w-6" />}
          color="text-indigo-600"
        />
        <DataCard
          label="Pending Balance"
          value={pendingBalance}
          shouldFormat
          description="Will be available soon"
          icon={<Clock className="h-6 w-6" />}
          color="text-orange-600"
        />
        <DataCard
          label="Withdrawn Revenue"
          value={withdrawnRevenue}
          shouldFormat
          description="Total withdrawn"
          icon={<TrendingUp className="h-6 w-6" />}
          color="text-purple-600"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-700">
          <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
          Withdrawal Options
        </h2>
        <div className="flex space-x-4">
          <WithdrawalDialog
            availableBalance={availableBalance}
            publisherId={publisherId}
          />
          {/* <Button variant="outline" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Withdraw to PayPal
          </Button> */}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-700">
          <Clock className="h-6 w-6 mr-2 text-blue-600" />
          Recent Transactions
        </h2>
        <Table>
          <TableCaption>A list of your recent transactions</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell
                  className={`text-right ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WalletPage;

//OLD CODE
