// actions/get-wallet-data.ts

import { db } from "@/lib/db";

type PurchaseWithCourse = {
  id: string;
  amount: number;
  royaltyAmount: number;
  createdAt: Date;
  course: {
    title: string;
  };
};

// Updated PendingWithdrawal interface to match DB schema
interface PendingWithdrawal {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
  bankAccount: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    qrCodeUrl?: string | null; // Updated to accept both undefined and null
  };
}

type WalletData = {
  totalRevenue: number;
  instructorRevenue: number;
  royalty: number;
  availableBalance: number;
  pendingBalance: number;
  withdrawnRevenue: number;
  transactions: {
    id: string;
    date: string;
    description: string;
    amount: number;
  }[];
  publisherId: string;
  pendingWithdrawals: PendingWithdrawal[];
};

export const getWalletData = async (userId: string): Promise<WalletData> => {
  const publisher = await db.publisher.findFirst({
    where: { courses: { some: { userId } } },
    select: {
      id: true,
      wallet: true,
      courses: {
        select: {
          purchases: {
            select: {
              id: true,
              amount: true,
              royaltyAmount: true,
              createdAt: true,
              paymentStatus: true,
              course: { select: { title: true } },
            },
          },
        },
      },
      withdrawalRequests: {
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          bankAccount: {
            select: {
              bankName: true,
              accountName: true,
              accountNumber: true,
              qrCodeUrl: true,
            },
          },
        },
      },
    },
  });

  if (!publisher) {
    throw new Error("Publisher not found");
  }

  // Separate purchases into completed and pending
  const allPurchases = publisher.courses.flatMap(course => course.purchases);
  
  // Calculate completed purchases
  const completedPurchases = allPurchases.filter(purchase => purchase.paymentStatus === "completed");
  const pendingPurchases = allPurchases.filter(purchase => purchase.paymentStatus === "pending");

  // Calculate revenues from completed purchases
  const totalRevenue = completedPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const royalty = completedPurchases.reduce((sum, purchase) => sum + purchase.royaltyAmount, 0);
  const instructorRevenue = totalRevenue - royalty;

  // Calculate pending purchases amount
  const pendingPurchaseAmount = pendingPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const pendingRoyaltyAmount = pendingPurchases.reduce((sum, purchase) => sum + purchase.royaltyAmount, 0);

  // Get all withdrawal requests
  const withdrawals = publisher.withdrawalRequests;
  const completedWithdrawals = withdrawals.filter(w => w.status === "completed");
  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending");
  
  // Calculate withdrawal amounts
  const withdrawnRevenue = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const pendingWithdrawalAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  // Calculate balances
  const availableBalance = instructorRevenue - withdrawnRevenue - pendingWithdrawalAmount;
  
  // Update pending balance calculation to include pending withdrawals
  const pendingBalance = pendingWithdrawalAmount + pendingPurchaseAmount;

  // Update the wallet in the database
  await db.wallet.upsert({
    where: { publisherId: publisher.id },
    create: {
      publisherId: publisher.id,
      totalRevenue,
      royalty,
      availableBalance,
      pendingBalance,
      withdrawnRevenue,
    },
    update: {
      totalRevenue,
      royalty,
      availableBalance,
      pendingBalance,
      withdrawnRevenue,
    },
  });

  // Create transactions with proper descriptions
  const pendingPurchaseTransactions = pendingPurchases.map(purchase => ({
    id: purchase.id,
    date: purchase.createdAt.toISOString().split('T')[0],
    description: `Pending Sale: ${purchase.course.title}`,
    amount: purchase.amount,
  }));

  const withdrawalTransactions = pendingWithdrawals.map(withdrawal => ({
    id: withdrawal.id,
    date: withdrawal.createdAt.toISOString().split('T')[0],
    description: `Withdrawal Request (Pending) - ${withdrawal.bankAccount.bankName}`,
    amount: -withdrawal.amount,
  }));

  const completedWithdrawalTransactions = completedWithdrawals.map(withdrawal => ({
    id: withdrawal.id,
    date: withdrawal.createdAt.toISOString().split('T')[0],
    description: `Withdrawal Completed - ${withdrawal.bankAccount.bankName}`,
    amount: -withdrawal.amount,
  }));

  const completedPurchaseTransactions = completedPurchases
    .map(purchase => ({
      id: purchase.id,
      date: purchase.createdAt.toISOString().split('T')[0],
      description: `Sale: ${purchase.course.title}`,
      amount: purchase.amount,
    }));

  // Combine and sort all transactions
  const allTransactions = [
    ...pendingPurchaseTransactions,
    ...withdrawalTransactions,
    ...completedWithdrawalTransactions,
    ...completedPurchaseTransactions
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return {
    totalRevenue,
    instructorRevenue,
    royalty,
    availableBalance,
    pendingBalance,
    withdrawnRevenue,
    transactions: allTransactions,
    publisherId: publisher.id,
    pendingWithdrawals,
  };
};

//OLD CODEEEE