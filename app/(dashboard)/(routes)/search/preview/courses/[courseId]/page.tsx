import { db } from "@/lib/db";
import { redirect } from "next/navigation";

interface PreviewPageProps {
  params: { courseId: string };
}

const CourseIdPage = async ({ params }: PreviewPageProps) => {
  const { courseId } = params;

  // Find the course and get its first chapter
  const course = await db.course.findUnique({
    where: {
      id: courseId,
      isPublished: true,
    },
    include: {
      chapters: {
        where: { isPublished: true },
        select: { id: true },
        orderBy: { position: "asc" },
      },
    },
  });

  // If the course doesn't exist, redirect to search
  if (!course || course.chapters.length === 0) {
    return redirect("/search");
  }

  // Redirect to the first chapter of the course
  return redirect(
    `/preview/courses/${courseId}/chapters/${course.chapters[0].id}`
  );
};

export default CourseIdPage;
