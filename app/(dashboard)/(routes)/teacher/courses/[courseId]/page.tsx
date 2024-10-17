// app/dashboard/(routes)/teacher/courses/[courseId]/page.tsx

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseIdPageClient } from "./_components/client";

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      userId,
    },
    include: {
      chapters: {
        orderBy: {
          position: "asc",
        },
      },
      attachments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!course) {
    return redirect("/");
  }

  // Fetch the deletion request status
  const deletionRequest = await db.deletionRequest.findFirst({
    where: {
      itemId: params.courseId,
      userId,
      type: "course",
    },
  });

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <CourseIdPageClient
      course={course}
      categories={categories}
      courseId={params.courseId}
      isPendingDeletion={
        !!deletionRequest && deletionRequest.status === "pending"
      }
    />
  );
};

export default CourseIdPage;
