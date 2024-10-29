// app/api/withdrawals/pending/[publisherId]/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
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

    const pendingWithdrawals = await db.withdrawalRequest.findMany({
      where: {
        publisherId: params.publisherId,
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

    console.log("Pending withdrawals fetched:", pendingWithdrawals); // Debugging log

    return NextResponse.json(pendingWithdrawals);
  } catch (error) {
    console.error("[PENDING_WITHDRAWALS]", error);
    return NextResponse.json(
      { error: "Failed to fetch pending withdrawals" },
      { status: 500 }
    );
  }
}