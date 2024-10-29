// app/api/bank-accounts/[publisherId]/[bankAccountId]/route.ts

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function PUT(
  req: Request,
  { params }: { params: { publisherId: string; bankAccountId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { publisherId, bankAccountId } = params;
    if (!publisherId || !bankAccountId) {
      return NextResponse.json(
        { error: "Publisher ID and Bank account ID are required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { bankName, accountName, accountNumber, qrCodeUrl } = body;

    // Validate required fields
    if (!bankName || !accountName || !accountNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the bank account exists and belongs to the publisher
    const existingAccount = await db.bankAccount.findFirst({
      where: {
        id: bankAccountId,
        publisherId: publisherId,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: "Bank account not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update bank account
    const updatedBankAccount = await db.bankAccount.update({
      where: {
        id: bankAccountId,
      },
      data: {
        bankName,
        accountName,
        accountNumber,
        qrCodeUrl: qrCodeUrl || null,
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

export async function GET(
  req: Request,
  { params }: { params: { publisherId: string; bankAccountId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { publisherId, bankAccountId } = params;
    if (!publisherId || !bankAccountId) {
      return NextResponse.json(
        { error: "Publisher ID and Bank account ID are required" },
        { status: 400 }
      );
    }

    const bankAccount = await db.bankAccount.findFirst({
      where: {
        id: bankAccountId,
        publisherId: publisherId,
      },
    });

    if (!bankAccount) {
      return NextResponse.json(
        { error: "Bank account not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(bankAccount);
  } catch (error) {
    console.error("Error fetching bank account:", error);
    return NextResponse.json(
      { error: "Failed to fetch bank account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { publisherId: string; bankAccountId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { publisherId, bankAccountId } = params;
    if (!publisherId || !bankAccountId) {
      return NextResponse.json(
        { error: "Publisher ID and Bank account ID are required" },
        { status: 400 }
      );
    }

    // First check if the bank account exists and belongs to the publisher
    const bankAccount = await db.bankAccount.findFirst({
      where: {
        id: bankAccountId,
        publisherId: publisherId,
      },
      include: {
        withdrawalRequests: {
          where: {
            status: "pending",
          },
        },
      },
    });

    if (!bankAccount) {
      return NextResponse.json(
        { error: "Bank account not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check for pending withdrawals
    if (bankAccount.withdrawalRequests.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete bank account with pending withdrawals. Please cancel all pending withdrawals first." },
        { status: 400 }
      );
    }

    // Delete all completed/cancelled withdrawal requests first
    await db.withdrawalRequest.deleteMany({
      where: {
        bankAccountId,
        status: {
          not: "pending"
        }
      },
    });

    // Now delete the bank account
    await db.bankAccount.delete({
      where: {
        id: bankAccountId,
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