import { db } from "@/lib/db";
import { Category, Chapter, Course, Publisher } from "@prisma/client";
import { getProgress } from "./get-progress";

type CourseWithProgressWithCategoryAndPublisher = Course & {
  category: Category;
  chapters: Chapter[];
  progress: number | null;
  publisher: Publisher;
};

type DashboardCourses = {
    completedCourses: CourseWithProgressWithCategoryAndPublisher[];
    coursesInProgress: CourseWithProgressWithCategoryAndPublisher[];
}

export const getDashboardCourses = async (userId: string): Promise<DashboardCourses> => {
    try {
        const purchasedCourses = await db.purchase.findMany({
            where: {
                userId: userId,
            },
            select: {
                course: {
                    include: {
                        category: true,
                        chapters: {
                            where: {
                                isPublished: true,
                            }
                        },
                        publisher: true // Include the publisher information
                    }
                }
            }
        });

        const courses = purchasedCourses.map((purchase) => purchase.course) as CourseWithProgressWithCategoryAndPublisher[];

        for (let course of courses) {
            const progress = await getProgress(userId, course.id);  
            course.progress = progress;
        }

        const completedCourses = courses.filter((course) => course.progress === 100);
        const coursesInProgress = courses.filter((course) => (course.progress ?? 0) < 100);

        return {
            completedCourses,
            coursesInProgress,
        }
    } catch (error) {
        console.log("[GET_DASHBOARD_COURSES]", error);
        return {
            completedCourses: [],
            coursesInProgress: [],
        }
    }
}