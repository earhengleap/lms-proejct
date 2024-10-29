// app/api/admin/wallet/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Helper function to validate administrator access
async function isAdministrator(userId: string) {
  if (!userId) return false;
  
  const user = await db.user.findUnique({
    where: { userId },
    select: { isInstructor: true },
  });

  return user?.isInstructor === true;
}

export async function POST(
  req: Request,
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin status
    const isAdmin = await isAdministrator(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { action, withdrawalId } = body;

    if (!withdrawalId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch the withdrawal request first
    const withdrawal = await db.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: {
        publisher: true,
        bankAccount: true,
      },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal request not found" },
        { status: 404 }
      );
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json(
        { error: "Can only process pending withdrawals" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Execute approval in a transaction
      const result = await db.$transaction(async (tx) => {
        // Update withdrawal status
        const updatedWithdrawal = await tx.withdrawalRequest.update({
          where: { id: withdrawalId },
          data: {
            status: "completed",
            processedAt: new Date(),
            adminNote: "Approved by administrator"
          },
        });

        // Update wallet balance
        await tx.wallet.update({
          where: { publisherId: withdrawal.publisherId },
          data: {
            withdrawnRevenue: {
              increment: withdrawal.amount
            }
          },
        });

        // Create activity log
        await tx.activity.create({
          data: {
            type: "WITHDRAWAL_APPROVED",
            description: `Approved withdrawal request of ${withdrawal.amount} for ${withdrawal.publisher.name}`,
            userId,
            itemId: withdrawalId,
            itemType: "withdrawal"
          },
        });

        return updatedWithdrawal;
      });

      // Revalidate relevant paths
      revalidatePath("/administrator");
      revalidatePath(`/teacher/wallet`);

      return NextResponse.json({
        success: true,
        message: "Withdrawal approved successfully",
        data: result
      });

    } else if (action === "reject") {
      // Execute rejection in a transaction
      const result = await db.$transaction(async (tx) => {
        // Update withdrawal status
        const updatedWithdrawal = await tx.withdrawalRequest.update({
          where: { id: withdrawalId },
          data: {
            status: "rejected",
            processedAt: new Date(),
            adminNote: "Rejected by administrator"
          },
        });

        // Restore the amount to available balance
        await tx.wallet.update({
          where: { publisherId: withdrawal.publisherId },
          data: {
            availableBalance: {
              increment: withdrawal.amount
            }
          },
        });

        // Create activity log
        await tx.activity.create({
          data: {
            type: "WITHDRAWAL_REJECTED",
            description: `Rejected withdrawal request of ${withdrawal.amount} for ${withdrawal.publisher.name}`,
            userId,
            itemId: withdrawalId,
            itemType: "withdrawal"
          },
        });

        return updatedWithdrawal;
      });

      // Revalidate relevant paths
      revalidatePath("/administrator");
      revalidatePath(`/teacher/wallet`);

      return NextResponse.json({
        success: true,
        message: "Withdrawal rejected successfully",
        data: result
      });

    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Admin wallet action error:", error);
    return NextResponse.json(
      { error: "Failed to process withdrawal request" },
      { status: 500 }
    );
  }
}

// Get pending withdrawals
export async function GET(
  req: Request,
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin status
    const isAdmin = await isAdministrator(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    // Fetch withdrawal requests
    const withdrawalRequests = await db.withdrawalRequest.findMany({
      where: {
        status: status as string,
      },
      include: {
        publisher: true,
        bankAccount: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(withdrawalRequests);

  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch withdrawal requests" },
      { status: 500 }
    );
  }
}