// app/api/admin/teachers/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { isAdministrator } from "@/lib/administrator";

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');

  if (!userId || !(await isAdministrator(userId))) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const teachers = await db.user.findMany({
      where: { isInstructor: true },
      include: {
        courses: {
          include: {
            purchases: true,
            category: true,
          },
        },
      },
    });

    const formattedTeachers = teachers.map((teacher) => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      totalStudents: teacher.courses.reduce(
        (acc, course) => acc + course.purchases.length,
        0
      ),
      totalCourses: teacher.courses.length,
      publishedCourses: teacher.courses.filter((course) => course.isPublished)
        .length,
      totalRevenue: teacher.courses.reduce(
        (acc, course) => acc + course.purchases.length * (course.price || 0),
        0
      ),
    }));

    return NextResponse.json(formattedTeachers);
  } catch (error) {
    console.error('[TEACHERS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}