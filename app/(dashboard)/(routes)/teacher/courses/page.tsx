// app/(dashboard)/(routes)/teacher/courses/page.tsx

import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const CoursesPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  // Fetch all courses for the user
  const courses = await db.course.findMany({
    where: {
      userId,
    },
    include: {
      chapters: true, // Include related chapters
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch all pending deletion requests for courses
  const courseDeletionRequests = await db.deletionRequest.findMany({
    where: {
      userId,
      type: "course",
      status: "pending",
    },
    select: {
      itemId: true,
      status: true,
    },
  });

  // Fetch all pending deletion requests for chapters
  const chapterDeletionRequests = await db.deletionRequest.findMany({
    where: {
      userId,
      type: "chapter",
      status: "pending",
    },
    select: {
      itemId: true,
      status: true,
    },
  });

  // Create a map for course and chapter deletion statuses
  const courseDeletionRequestMap = new Map(
    courseDeletionRequests.map((request) => [request.itemId, request.status])
  );
  const chapterDeletionRequestMap = new Map(
    chapterDeletionRequests.map((request) => [request.itemId, request.status])
  );

  // Map courses to include both course and chapter deletion statuses
  const coursesWithDeletionStatus = courses.map((course) => ({
    ...course,
    deletionStatus: courseDeletionRequestMap.get(course.id) || null,
    chapters: course.chapters.map((chapter) => ({
      ...chapter,
      deletionStatus: chapterDeletionRequestMap.get(chapter.id) || null,
    })),
  }));

  return (
    <div className="p-6">
      <DataTable columns={columns} data={coursesWithDeletionStatus} />
    </div>
  );
};

export default CoursesPage;

//OLD CODE