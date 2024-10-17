// app/api/payment-success/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Import your db connection
import { currentUser } from "@clerk/nextjs/server"; // Import Clerk to get current user

// Named export for GET method (success callback)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const transactionId = searchParams.get("transactionId");

  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Ensure the course exists
    const course = await db.course.findUnique({
      where: { id: courseId! },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Assume payment success (you may want to verify this with ABA PayWay if possible)
    const coursePrice = course.price !== null ? course.price : 0;

    // Store the purchase in the database after successful payment
    await db.purchase.create({
      data: {
        userId: user.id,
        courseId: course.id,
        price: coursePrice, // Store the price of the course
        paymentMethod: "aba", // Record the payment method as ABA PayWay
        transactionId: transactionId!, // Store the transaction ID
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Redirect to the course or success page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/search/preview/courses/${courseId}/chapters?success=1`);
  } catch (error) {
    console.error("[PAYMENT_SUCCESS]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
