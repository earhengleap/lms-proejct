// app/api/bank-accounts/[publisherId]/route.ts

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: { publisherId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the publisherId is provided
    if (!params.publisherId) {
      return NextResponse.json(
        { error: "Publisher ID is required" },
        { status: 400 }
      );
    }

    // Optional: Verify the user has permission to access this publisher's data
    const publisher = await db.publisher.findUnique({
      where: {
        id: params.publisherId,
      },
      include: {
        courses: {
          where: {
            userId,
          },
        },
      },
    });

    if (!publisher) {
      return NextResponse.json(
        { error: "Publisher not found" },
        { status: 404 }
      );
    }

    // Fetch bank accounts with their associated withdrawal requests
    const bankAccounts = await db.bankAccount.findMany({
      where: {
        publisherId: params.publisherId,
      },
      include: {
        withdrawalRequests: {
          where: {
            status: "pending",
          },
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response to include additional details
    const formattedBankAccounts = bankAccounts.map(account => ({
      id: account.id,
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      qrCodeUrl: account.qrCodeUrl,
      isDefault: account.isDefault,
      createdAt: account.createdAt,
      pendingWithdrawals: account.withdrawalRequests.length,
      totalPendingAmount: account.withdrawalRequests.reduce(
        (sum, request) => sum + request.amount,
        0
      ),
    }));

    return NextResponse.json(formattedBankAccounts);
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch bank accounts" },
      { status: 500 }
    );
  }
}

// Handle setting a bank account as default
export async function PATCH(
  req: Request,
  { params }: { params: { publisherId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bankAccountId } = await req.json();

    if (!bankAccountId) {
      return NextResponse.json(
        { error: "Bank account ID is required" },
        { status: 400 }
      );
    }

    // Update all bank accounts for this publisher to not be default
    await db.bankAccount.updateMany({
      where: {
        publisherId: params.publisherId,
      },
      data: {
        isDefault: false,
      },
    });

    // Set the selected bank account as default
    const updatedBankAccount = await db.bankAccount.update({
      where: {
        id: bankAccountId,
        publisherId: params.publisherId,
      },
      data: {
        isDefault: true,
      },
    });

    return NextResponse.json(updatedBankAccount);
  } catch (error) {
    console.error("Error updating bank account:", error);
    return NextResponse.json(
      { error: "Failed to update bank account" },
      { status: 500 }
    );
  }
}

// Handle deleting a bank account
export async function DELETE(
  req: Request,
  { params }: { params: { publisherId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const bankAccountId = url.searchParams.get("bankAccountId");

    if (!bankAccountId) {
      return NextResponse.json(
        { error: "Bank account ID is required" },
        { status: 400 }
      );
    }

    // Check if there are any pending withdrawal requests
    const hasPendingWithdrawals = await db.withdrawalRequest.findFirst({
      where: {
        bankAccountId,
        status: "pending",
      },
    });

    if (hasPendingWithdrawals) {
      return NextResponse.json(
        { error: "Cannot delete bank account with pending withdrawals" },
        { status: 400 }
      );
    }

    // Delete the bank account
    await db.bankAccount.delete({
      where: {
        id: bankAccountId,
        publisherId: params.publisherId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bank account:", error);
    return NextResponse.json(
      { error: "Failed to delete bank account" },
      { status: 500 }
    );
  }
}