import { PrismaClient } from '@prisma/client';
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export interface HeatMapDataPoint {
  date: string;
  count: number;
}

const getHeatMapData = async (): Promise<HeatMapDataPoint[]> => {
  const { userId } = auth();

  if (!userId) {
    return [];
  }

  const data = await prisma.quizSubmission.groupBy({
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
};

export default getHeatMapData;