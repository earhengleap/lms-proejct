// app/api/withdrawals/[requestId]/cancel/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function DELETE(
  req: Request,
  { params }: { params: { requestId: string } }  // Changed to requestId
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = params;  // Changed to requestId

    console.log("Processing cancellation for withdrawal:", requestId);

    // First fetch the withdrawal request with publisher details
    const withdrawal = await db.withdrawalRequest.findUnique({
      where: { 
        id: requestId  // Changed to requestId
      },
      include: {
        publisher: true,
        bankAccount: true,
      }
    });

    if (!withdrawal) {
      console.log("Withdrawal not found:", requestId);
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    if (withdrawal.status !== "pending") {
      console.log("Invalid status for cancellation:", withdrawal.status);
      return NextResponse.json(
        { error: "Only pending withdrawals can be canceled" },
        { status: 400 }
      );
    }

    // Verify user has permission to cancel this withdrawal
    const publisher = await db.publisher.findFirst({
      where: {
        id: withdrawal.publisherId,
        courses: {
          some: {
            userId: userId
          }
        }
      }
    });

    if (!publisher) {
      console.log("User not authorized:", userId);
      return NextResponse.json(
        { error: "Not authorized to cancel this withdrawal" },
        { status: 403 }
      );
    }

    // Perform the cancellation transaction
    const result = await db.$transaction([
      // Update withdrawal status
      db.withdrawalRequest.update({
        where: { id: requestId },
        data: { 
          status: "canceled",
          adminNote: "Cancelled by user request"
        }
      }),
      
      // Restore the amount to wallet
      db.wallet.update({
        where: { publisherId: withdrawal.publisherId },
        data: {
          availableBalance: {
            increment: withdrawal.amount
          }
        }
      }),

      // Create an activity log
      db.activity.create({
        data: {
          type: "WITHDRAWAL_CANCELLED",
          description: `Withdrawal request of $${withdrawal.amount} was cancelled`,
          userId,
          itemType: "withdrawal",
          itemId: requestId
        }
      })
    ]);

    // Revalidate relevant paths
    revalidatePath("/teacher/wallet");
    revalidatePath("/administrator");

    return NextResponse.json({
      success: true,
      message: "Withdrawal successfully cancelled",
      data: result[0]
    });

  } catch (error) {
    console.error("Withdrawal cancellation error:", error);
    return NextResponse.json(
      { error: "Failed to cancel withdrawal request" },
      { status: 500 }
    );
  }
}