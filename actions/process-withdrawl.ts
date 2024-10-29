// app/actions/process-withdrawal.ts
"use server"; // Add this line at the top

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type WithdrawalFormData = {
  amount: number;
  publisherId: string;
  bankAccountId: string;
};

export const processWithdrawal = async (data: WithdrawalFormData) => {
  try {
    // First find the wallet and related data
    const wallet = await db.wallet.findUnique({
      where: { publisherId: data.publisherId },
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.availableBalance < data.amount) {
      throw new Error("Insufficient balance");
    }

    // Separately fetch bank account
    const bankAccount = await db.bankAccount.findUnique({
      where: { id: data.bankAccountId },
    });

    if (!bankAccount) {
      throw new Error("No bank account found");
    }

    // Create withdrawal request
    const withdrawalRequest = await db.withdrawalRequest.create({
      data: {
        amount: data.amount,
        publisherId: data.publisherId,
        bankAccountId: data.bankAccountId,
        status: "pending",
      },
    });

    // Create activity log
    await db.activity.create({
      data: {
        type: "WITHDRAWAL_REQUEST",
        description: `New withdrawal request for $${data.amount} to ${bankAccount.bankName} - ${bankAccount.accountNumber}`,
        userId: data.publisherId,
        itemType: "withdrawal",
        itemId: withdrawalRequest.id,
      },
    });

    revalidatePath("/teacher/wallet");

    return { 
      success: true,
      withdrawalRequest,
      wallet 
    };
  } catch (error) {
    console.error("Withdrawal error:", error);
    throw error;
  }
};