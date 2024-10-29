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

interface PendingWithdrawal {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
  bankAccount: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    qrCodeUrl?: string | null;
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
  publisherId: string | null;
  pendingWithdrawals: PendingWithdrawal[];
};

const defaultWalletData: WalletData = {
  totalRevenue: 0,
  instructorRevenue: 0,
  royalty: 0,
  availableBalance: 0,
  pendingBalance: 0,
  withdrawnRevenue: 0,
  transactions: [],
  publisherId: null,
  pendingWithdrawals: [],
};

export const getWalletData = async (userId: string): Promise<WalletData> => {
  try {
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

    // If no publisher is found, return default values
    if (!publisher) {
      return defaultWalletData;
    }

    // Separate purchases into completed and pending
    const allPurchases = publisher.courses.flatMap(course => course.purchases);
    
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
    const pendingBalance = pendingWithdrawalAmount + pendingPurchaseAmount;

    // Only update wallet if publisher exists
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

    // Create transactions
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

    const completedPurchaseTransactions = completedPurchases.map(purchase => ({
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
  } catch (error) {
    console.error("[GET_WALLET_DATA_ERROR]", error);
    return defaultWalletData;
  }
};