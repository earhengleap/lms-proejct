// app/(dashboard)/(routes)/administrator/_components/transaction-history.tsx

"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownRight,
  History,
  Eye,
  DollarSign,
  Calendar,
  User,
  CreditCard,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "withdrawal" | "purchase";
  amount: number;
  status: string;
  createdAt: Date;
  publisher: {
    name: string | null;
  } | null; // Make publisher nullable
  user?: {
    name: string | null;
  } | null; // Make user nullable
  course?: {
    title: string;
  };
  bankAccount?: {
    bankName: string;
    accountNumber: string;
  };
}

interface TransactionHistoryProps {
  initialTransactions: Transaction[];
}

export const TransactionHistory = ({
  initialTransactions,
}: TransactionHistoryProps) => {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const TransactionDetails = ({
    transaction,
  }: {
    transaction: Transaction;
  }) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {transaction.type === "withdrawal" ? "Withdrawal" : "Purchase"}
          </h3>
          <Badge className={getStatusColor(transaction.status)}>
            {transaction.status}
          </Badge>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-xl font-bold">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(transaction.createdAt), "PPP p")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {transaction.type === "withdrawal" ? (
                <>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Publisher: {transaction.publisher?.name || "Unknown"}
                    </span>
                  </div>
                  {transaction.bankAccount && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {transaction.bankAccount.bankName} -{" "}
                        {transaction.bankAccount.accountNumber}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Buyer: {transaction.user?.name || "Unknown"}</span>
                  </div>
                  {transaction.course && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Course: {transaction.course.title}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-500" />
            <CardTitle>Transaction History</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
        {initialTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-full ${
                  transaction.type === "withdrawal"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {transaction.type === "withdrawal" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {transaction.type === "withdrawal"
                    ? "Withdrawal Request"
                    : "Course Purchase"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(transaction.createdAt), "PPP")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p
                className={`font-medium ${
                  transaction.type === "withdrawal"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {transaction.type === "withdrawal" ? "-" : "+"}
                {formatCurrency(transaction.amount)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      <Sheet
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
      >
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Transaction Details</SheetTitle>
            <SheetDescription>
              View detailed information about this transaction
            </SheetDescription>
          </SheetHeader>
          {selectedTransaction && (
            <div className="mt-6">
              <TransactionDetails transaction={selectedTransaction} />
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
};
