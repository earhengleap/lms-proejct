// actions/get-analytics.ts

import { db } from "@/lib/db";

interface MonthlyData {
  total: number;
  courses: { [key: string]: number };
}

export const getAnalytics = async (userId: string) => {
  try {
    // First get the publisher ID for this user
    const publisher = await db.publisher.findFirst({
      where: { courses: { some: { userId } } },
      select: { id: true },
    });

    // If no publisher found, return default values
    if (!publisher) {
      return {
        data: Array(12).fill(null).map((_, index) => ({
          name: `Month ${index + 1}`,
          total: 0,
          courses: [],
        })),
        totalRevenue: 0,
        instructorRevenue: 0,
        totalSales: 0,
        completionRates: [],
        studentDemographics: [],
        withdrawnRevenue: 0,
        royalty: 0,
        availableBalance: 0,
      };
    }

    const [purchases, courseCompletionRates, studentDemographics, withdrawalData] = await Promise.all([
      db.purchase.findMany({
        where: {
          course: {
            userId: userId,
          },
        },
        select: {
          amount: true,
          royaltyAmount: true,
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
      db.withdrawalRequest.findMany({
        where: {
          publisherId: publisher.id,
          status: 'completed',
        },
        select: {
          amount: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate withdrawal revenue with fallback to 0
    const withdrawnRevenue = withdrawalData?.reduce((sum, withdrawal) => sum + withdrawal.amount, 0) || 0;

    // Monthly aggregates calculation including withdrawals
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
      Array(12).fill(null).map(() => ({ total: 0, courses: {} }))
    );

    // Calculate monthly withdrawals safely
    withdrawalData?.forEach(withdrawal => {
      const month = withdrawal.createdAt.getMonth();
      if (!monthlyAggregates[month]) {
        monthlyAggregates[month] = { total: 0, courses: {} };
      }
      monthlyAggregates[month].total -= withdrawal.amount;
    });

    const totalRevenue = purchases?.reduce((sum, purchase) => sum + purchase.amount, 0) || 0;
    const royalty = purchases?.reduce((sum, purchase) => sum + purchase.royaltyAmount, 0) || 0;
    const instructorRevenue = totalRevenue - royalty;

    const completionRates = courseCompletionRates?.map((course) => {
      const totalPurchases = course._count.purchases || 1;
      const totalChapters = course.chapters.length || 1;
      const totalProgress = course.chapters.reduce(
        (acc, chapter) => acc + chapter.userProgress.length,
        0
      );

      return {
        title: course.title,
        completionRate: totalProgress / (totalPurchases * totalChapters),
      };
    }) || [];

    const formattedDemographics = await Promise.all(
      (studentDemographics || []).map(async (group) => {
        const user = await db.user.findUnique({
          where: { id: group.userId },
          select: { isInstructor: true },
        });
        return {
          category: user?.isInstructor ? 'Instructors' : 'Students',
          count: group._count,
        };
      })
    );

    // Add withdrawal transactions to monthly data
    const monthlyData = monthlyAggregates.map((month, index) => ({
      name: `Month ${index + 1}`,
      total: month.total,
      courses: Object.entries(month.courses).map(([title, price]) => ({
        title,
        price: Number(price),
      })),
    }));

    return {
      data: monthlyData,
      totalRevenue,
      instructorRevenue,
      totalSales: purchases.length,
      completionRates,
      studentDemographics: formattedDemographics,
      withdrawnRevenue,
      royalty,
      availableBalance: instructorRevenue - withdrawnRevenue,
    };
  } catch (error) {
    console.error("[GET_ANALYTICS_ERROR]", error);
    // Return default values if anything fails
    return {
      data: Array(12).fill(null).map((_, index) => ({
        name: `Month ${index + 1}`,
        total: 0,
        courses: [],
      })),
      totalRevenue: 0,
      instructorRevenue: 0,
      totalSales: 0,
      completionRates: [],
      studentDemographics: [],
      withdrawnRevenue: 0,
      royalty: 0,
      availableBalance: 0,
    };
  }
};