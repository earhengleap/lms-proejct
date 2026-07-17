// app/api/courses/[courseId]/route.ts

import { db } from "@/lib/db";
import { isAdministrator } from "@/lib/administrator";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isAdmin = await isAdministrator(userId);

    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
      },
      include: {
        chapters: true,
      },
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const deletedCourse = await db.course.delete({
      where: {
        id: params.courseId,
      },
    });

    await db.deletionRequest.deleteMany({
      where: {
        itemId: params.courseId,
        type: "course",
      },
    });

    await db.activity.create({
      data: {
        type: "COURSE_DELETED",
        description: `Course deleted: ${deletedCourse.title}`,
        userId,
        itemId: params.courseId,
        itemType: "course",
      },
    });

    return NextResponse.json(deletedCourse);
  } catch (error) {
    console.log("[COURSES_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;
    const values = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let publisherId = undefined;

    if (values.publisherName) {
      let publisher = await db.publisher.findFirst({
        where: { name: values.publisherName }
      });

      if (!publisher) {
        publisher = await db.publisher.create({
          data: { name: values.publisherName }
        });
      }

      publisherId = publisher.id;
    }

    const course = await db.course.update({
      where: {
        id: courseId,
        userId,
      },
      data: {
        ...values,
        publisherId: publisherId || undefined,
      },
      include: {
        publisher: true
      }
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}