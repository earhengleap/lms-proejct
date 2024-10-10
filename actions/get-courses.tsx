import { db } from "@/lib/db";
import { Category, Course, Publisher } from "@prisma/client";
import { getProgress } from "./get-progress";

type CourseWithProgressWithCategoryAndPublisher = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
  publisher: Publisher | null;
};

type GetCourses = {
  userId: string | undefined;
  title: string;
  categoryId: string;
};

export const getCourses = async ({
  userId,
  title,
  categoryId,
}: GetCourses): Promise<CourseWithProgressWithCategoryAndPublisher[]> => {
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
        publisher: true, // Include the publisher information
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const coursesWithProgress: CourseWithProgressWithCategoryAndPublisher[] =
      userId
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
        : courses.map((course) => ({ ...course, progress: null }));

    return coursesWithProgress;
  } catch (error) {
    console.log("GET_COURSES_ERROR", error);
    return [];
  }
};
