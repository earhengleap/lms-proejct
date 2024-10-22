// File: app/actions/get-wallet-data.ts

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

export const getWalletData = async (userId: string) => {
  const publisher = await db.publisher.findFirst({
    where: { courses: { some: { userId } } },
    select: {
      id: true,
      Wallet: true,
      courses: {
        select: {
          purchases: {
            select: {
              id: true,
              amount: true,
              royaltyAmount: true,
              createdAt: true,
              course: { select: { title: true } },
            },
          },
        },
      },
    },
  });

  if (!publisher) {
    throw new Error("Publisher not found");
  }

  const allPurchases: PurchaseWithCourse[] = publisher.courses.flatMap(course => course.purchases);

  const totalRevenue = allPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const royalty = allPurchases.reduce((sum, purchase) => sum + purchase.royaltyAmount, 0);
  const instructorRevenue = totalRevenue - royalty;
  const withdrawnRevenue = publisher.Wallet?.withdrawnRevenue || 0;
  const availableBalance = instructorRevenue - withdrawnRevenue;
  const pendingBalance = royalty;

  // Update the wallet in the database without assigning the result to a variable
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

  const transactions = allPurchases
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10)
    .map(purchase => ({
      id: purchase.id,
      date: purchase.createdAt.toISOString().split('T')[0],
      description: `Sale: ${purchase.course.title}`,
      amount: purchase.amount,
    }));

  return {
    totalRevenue,
    instructorRevenue,
    royalty,
    availableBalance,
    pendingBalance,
    withdrawnRevenue,
    transactions,
  };
};

//OLD CODE