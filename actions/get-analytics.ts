// actions/get-analytics.ts

import { db } from "@/lib/db";

interface MonthlyData {
  total: number;
  courses: { [key: string]: number };
}

export const getAnalytics = async (userId: string) => {
  const [purchases, courseCompletionRates, studentDemographics] = await Promise.all([
    db.purchase.findMany({
      where: {
        course: {
          userId: userId,
        },
      },
      select: {
        amount: true, // This will contain the original price
        createdAt: true,
        course: {
          select: {
            title: true,
          },
        },
      },
    }),
    db.course.findMany({
      where: { userId },
      select: {
        title: true,
        chapters: {
          select: {
            userProgress: {
              where: { isCompleted: true },
              select: { userId: true },
            },
          },
        },
        _count: { select: { purchases: true } },
      },
    }),
    db.purchase.groupBy({
      by: ['userId'],
      where: {
        course: {
          userId: userId,
        },
      },
      _count: true,
    }),
  ]);

  const monthlyAggregates: MonthlyData[] = purchases.reduce(
    (acc: MonthlyData[], purchase) => {
      const month = purchase.createdAt.getMonth();
      if (!acc[month]) {
        acc[month] = { total: 0, courses: {} };
      }
      acc[month].total += purchase.amount;
      const courseTitle = purchase.course.title;
      acc[month].courses[courseTitle] =
        (acc[month].courses[courseTitle] || 0) + purchase.amount;
      return acc;
    },
    Array(12).fill(null).map(() => ({ total: 0, courses: {} })),
  );

  const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

  const royalty = totalRevenue * 0.1;
  const instructorRevenue = totalRevenue - royalty;

  const completionRates = courseCompletionRates.map((course) => {
    const totalPurchases = course._count.purchases || 1;
    const totalChapters = course.chapters.length || 1;
    const totalProgress = course.chapters.reduce(
      (acc, chapter) => acc + chapter.userProgress.length,
      0,
    );

    return {
      title: course.title,
      completionRate: totalProgress / (totalPurchases * totalChapters),
    };
  });

  const formattedDemographics = await Promise.all(
    studentDemographics.map(async (group) => {
      const user = await db.user.findUnique({
        where: { id: group.userId },
        select: { isInstructor: true },
      });
      return {
        category: user?.isInstructor ? 'Instructors' : 'Students',
        count: group._count,
      };
    }),
  );

  return {
    data: monthlyAggregates.map((month, index) => ({
      name: `Month ${index + 1}`,
      total: month.total,
      courses: Object.entries(month.courses).map(([title, price]) => ({
        title,
        price: Number(price),
      })),
    })),
    totalRevenue, // Original price of all purchases (before royalty)
    instructorRevenue, // Revenue after royalty deduction
    totalSales: purchases.length,
    completionRates,
    studentDemographics: formattedDemographics,
    withdrawnRevenue: 0,
    royalty: royalty,
  };
};

//OLD CODE