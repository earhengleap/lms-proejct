// app/api/admin/courses/[courseId]/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { isAdministrator } from "@/lib/administrator";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId || !(await isAdministrator(userId))) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.delete({
      where: {
        id: params.courseId,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log("[ADMIN_COURSE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}