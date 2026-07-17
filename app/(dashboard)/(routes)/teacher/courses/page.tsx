import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BookOpen } from "lucide-react";

const CoursesPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const courses = await db.course.findMany({
    where: {
      userId,
    },
    include: {
      chapters: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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

  const courseDeletionRequestMap = new Map(
    courseDeletionRequests.map((request) => [request.itemId, request.status])
  );
  const chapterDeletionRequestMap = new Map(
    chapterDeletionRequests.map((request) => [request.itemId, request.status])
  );

  const coursesWithDeletionStatus = courses.map((course) => ({
    ...course,
    deletionStatus: courseDeletionRequestMap.get(course.id) || null,
    chapters: course.chapters.map((chapter) => ({
      ...chapter,
      deletionStatus: chapterDeletionRequestMap.get(chapter.id) || null,
    })),
  }));

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
            <BookOpen className="h-4.5 w-4.5 text-sky-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
        </div>
        <p className="text-sm text-slate-500 ml-12">
          Manage and organize your courses
        </p>
      </div>
      <DataTable columns={columns} data={coursesWithDeletionStatus} />
    </div>
  );
};

export default CoursesPage;
