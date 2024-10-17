// actions/get-progress.tsx

import { db } from "@/lib/db";

export const getProgress = async (
  userId: string,
  courseId: string
): Promise<number> => {
  try {
    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    const chapters = await db.chapter.findMany({
      where: {
        courseId: courseId,
        ...(purchase ? {} : { isPublished: true }),
      },
      select: {
        id: true,
      },
    });

    const chapterIds = chapters.map((chapter) => chapter.id);

    const validCompletedChapters = await db.userProgress.count({
      where: {
        userId: userId,
        chapterId: {
          in: chapterIds,
        },
        isCompleted: true,
      },
    });

    const progressPercentage =
      (validCompletedChapters / chapterIds.length) * 100;
    return progressPercentage;
  } catch (error) {
    console.log("GET_PROGRESS_ERROR", error);
    return 0;
  }
};
