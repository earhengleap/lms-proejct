import { db } from "@/lib/db";
import { Category, Course } from "@prisma/client";
import { getProgress } from "./get-progress";

type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

type GetCoures = {
  userId: string | undefined;
  title: string;
  categoryId: string;
};

export const getCourses = async ({
  userId,
  title,
  categoryId,
}: GetCoures): Promise<CourseWithProgressWithCategory[]> => {
  try {
    const courses = await db.course.findMany({
      where: {
        isPublished: true,
        title: {
          contains: title,
        },
        categoryId,
      },
      include: {
        category: true,
        chapters: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
          },
        },
        purchases: {
          where: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const coursesWithProgress: CourseWithProgressWithCategory[] = userId
      ? await Promise.all(
          courses.map(async (course) => {
            if (course.purchases.length === 0) {
              return {
                ...course,
                progress: null,
              };
            }

            const progressPercentage = await getProgress(userId, course.id);
            return {
              ...course,
              progress: progressPercentage,
            };
          })
        )
      : courses.map((course) => ({ ...course, progress: null })); //! Return courses with null progress if no userId

    return coursesWithProgress;
  } catch (error) {
    console.log("GET_COURSES_ERROR", error);
    return [];
  }
};
