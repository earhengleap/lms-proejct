import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { isAdministrator } from "@/lib/administrator";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId || !(await isAdministrator(userId))) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courses = await db.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        price: true,
        isPublished: true,
        createdAt: true,
        publisher: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            chapters: true,
            purchases: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.log("[ADMIN_COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}