import { db } from "@/lib/db";
import { Category, Course, Publisher } from "@prisma/client";
import { getProgress } from "./get-progress";

type CourseWithProgressWithCategoryAndPublisher = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
  publisher: Publisher | null;
  purchased?: boolean;
};

type GetCourses = {
  userId: string | undefined;
  title?: string;
  categoryId?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export const getAllCourses = async (userId?: string) => {
  try {
    const courses = await db.course.findMany({
      where: { isPublished: true },
      include: {
        category: true,
        chapters: {
          where: { isPublished: true },
          select: { id: true },
        },
        purchases: {
          where: userId ? { userId } : undefined,
          select: { id: true },
        },
        publisher: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return courses.map((course) => ({
      ...course,
      progress: null,
      purchased: course.purchases.length > 0,
    }));
  } catch (error) {
    console.log("GET_ALL_COURSES_ERROR", error);
    return [];
  }
};

export const getCourses = async ({
  userId,
  title,
  categoryId,
  sort,
  page = 1,
  pageSize = 12,
}: GetCourses) => {
  try {
    const where: any = {
      isPublished: true,
    };

    if (title) {
      where.title = {
        contains: title,
        mode: "insensitive",
      };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    else if (sort === "price-desc") orderBy = { price: "desc" };
    else if (sort === "oldest") orderBy = { createdAt: "asc" };

    const [courses, totalCount] = await Promise.all([
      db.course.findMany({
        where,
        include: {
          category: true,
          chapters: {
            where: { isPublished: true },
            select: { id: true },
          },
          purchases: {
            where: { userId },
          },
          publisher: true,
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.course.count({ where }),
    ]);

    const coursesWithProgress: CourseWithProgressWithCategoryAndPublisher[] =
      userId
        ? await Promise.all(
            courses.map(async (course) => {
              if (course.purchases.length === 0) {
                return { ...course, progress: null };
              }
              const progressPercentage = await getProgress(userId, course.id);
              return { ...course, progress: progressPercentage };
            })
          )
        : courses.map((course) => ({ ...course, progress: null }));

    return {
      courses: coursesWithProgress,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.log("GET_COURSES_ERROR", error);
    return { courses: [], totalCount: 0, totalPages: 0, currentPage: 1 };
  }
};
