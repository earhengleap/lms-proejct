import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export interface HeatMapDataPoint {
  date: string;
  count: number;
}

const getHeatMapData = async (): Promise<HeatMapDataPoint[]> => {
  const { userId } = auth();

  if (!userId) {
    return [];
  }

  try {
    const data = await db.quizSubmission.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
      where: {
        userId: userId  // Only get submissions for the current user
      }
    });

    return data.map(item => ({
      date: item.createdAt.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      count: item._count.id
    }));
  } catch (error) {
    console.error("Failed to load heat map data:", error);
    return [];
  }
};

export default getHeatMapData;