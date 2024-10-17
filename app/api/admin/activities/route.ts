import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { isAdministrator } from "@/lib/administrator";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "7days";

    if (!userId || !(await isAdministrator(userId))) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const startDate = new Date();
    switch (period) {
      case "7days":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "3months":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const recentActivities = await db.activity.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to 50 most recent activities
    });

    return NextResponse.json(recentActivities);
  } catch (error) {
    console.log("[GET_RECENT_ACTIVITIES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = auth();

    if (!userId || !(await isAdministrator(userId))) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.activity.deleteMany({});

    return new NextResponse("Activities cleared", { status: 200 });
  } catch (error) {
    console.log("[CLEAR_ACTIVITIES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}