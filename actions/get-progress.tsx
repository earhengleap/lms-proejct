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
        isPublished: true, // Always fetch only published chapters
      },
      select: {
        id: true,
        videoUrl: true, // Include videoUrl in the selection
      },
    });

    // Filter chapters to include only those with video content
    const chaptersWithVideo = chapters.filter(
      (chapter) => chapter.videoUrl !== null && chapter.videoUrl !== ""
    );
    const chapterIds = chaptersWithVideo.map((chapter) => chapter.id);

    const validCompletedChapters = await db.userProgress.count({
      where: {
        userId: userId,
        chapterId: {
          in: chapterIds,
        },
        isCompleted: true,
      },
    });

    if (chapterIds.length === 0) {
      return 0; // Avoid division by zero if there are no chapters with videos
    }

    const progressPercentage =
      (validCompletedChapters / chapterIds.length) * 100;
    return Math.round(progressPercentage); // Round to nearest integer
  } catch (error) {
    console.log("GET_PROGRESS_ERROR", error);
    return 0;
  }
};
