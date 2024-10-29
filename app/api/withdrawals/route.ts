// app/api/withdrawals/route.ts

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function POST(
  request: Request,
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, publisherId, bankAccountId } = body;

    // Log the request data
    console.log("Withdrawal request:", { amount, publisherId, bankAccountId });

    // Verify the wallet has sufficient balance
    const wallet = await db.wallet.findUnique({
      where: { publisherId },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    if (wallet.availableBalance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Verify bank account exists
    const bankAccount = await db.bankAccount.findUnique({
      where: { id: bankAccountId },
      include: {
        publisher: true,
      },
    });

    if (!bankAccount) {
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: 404 }
      );
    }

    // Use a transaction to ensure data consistency
    const [withdrawalRequest, updatedWallet] = await db.$transaction([
      // Create withdrawal request
      db.withdrawalRequest.create({
        data: {
          amount,
          publisherId,
          bankAccountId,
          status: "pending",
        },
        include: {
          bankAccount: {
            select: {
              bankName: true,
              accountName: true,
              accountNumber: true,
              qrCodeUrl: true,
            },
          },
        },
      }),
      
      // Update wallet balance
      db.wallet.update({
        where: { publisherId },
        data: {
          availableBalance: {
            decrement: amount,
          },
        },
      }),
    ]);

    // Create activity log
    await db.activity.create({
      data: {
        type: "WITHDRAWAL_REQUEST",
        description: `New withdrawal request for $${amount} to ${bankAccount.bankName} - ${bankAccount.accountNumber}`,
        userId,
        itemType: "withdrawal",
        itemId: withdrawalRequest.id,
      },
    });

    // Revalidate relevant paths
    revalidatePath("/teacher/wallet");
    revalidatePath("/administrator");
    revalidatePath(`/api/withdrawals/pending/${publisherId}`);

    return NextResponse.json({
      success: true,
      withdrawalRequest,
      wallet: updatedWallet,
    });
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    return NextResponse.json(
      { error: "Failed to create withdrawal request" },
      { status: 500 }
    );
  }
}

// Add this to handle OPTIONS requests
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Add this to handle GET requests for pending withdrawals
export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const publisherId = url.searchParams.get("publisherId");

    if (!publisherId) {
      return NextResponse.json(
        { error: "Publisher ID is required" },
        { status: 400 }
      );
    }

    const pendingWithdrawals = await db.withdrawalRequest.findMany({
      where: {
        publisherId,
        status: "pending",
      },
      include: {
        bankAccount: {
          select: {
            bankName: true,
            accountName: true,
            accountNumber: true,
            qrCodeUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pendingWithdrawals);
  } catch (error) {
    console.error("Error fetching pending withdrawals:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending withdrawals" },
      { status: 500 }
    );
  }
}