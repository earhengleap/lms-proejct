// File: app/actions/handle-purchase.ts

import { db } from "@/lib/db";

export const handlePurchase = async (courseId: string, amount: number, userId: string) => {
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { publisherId: true },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const royaltyAmount = amount * 0.1; // 10% royalty

  await db.$transaction(async (tx) => {
    // Create the purchase record
    await tx.purchase.create({
      data: {
        userId,
        courseId,
        amount,
        royaltyAmount,
        paymentStatus: "completed",
        paymentMethod: "abapay", // or whatever method you're using
        transactionId: `${Date.now()}`, // You might want to generate a more robust transaction ID
        publisherId: course.publisherId,
      },
    });

    // Update the wallet
    const currentWallet = await tx.wallet.findUnique({
      where: { publisherId: course.publisherId },
    });

    if (currentWallet) {
      await tx.wallet.update({
        where: { publisherId: course.publisherId },
        data: {
          totalRevenue: { increment: amount },
          royalty: { increment: royaltyAmount },
          availableBalance: { increment: amount - royaltyAmount },
          pendingBalance: { increment: royaltyAmount },
        },
      });
    } else {
      await tx.wallet.create({
        data: {
          publisherId: course.publisherId,
          totalRevenue: amount,
          royalty: royaltyAmount,
          availableBalance: amount - royaltyAmount,
          pendingBalance: royaltyAmount,
          withdrawnRevenue: 0,
        },
      });
    }
  });
};