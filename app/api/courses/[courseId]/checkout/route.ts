// app/api/courses/[courseId]/checkout/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Import your db connection
import { stripe } from "@/lib/stripe"; // Import your stripe configuration
import { currentUser } from "@clerk/nextjs/server"; // Import Clerk to get current user

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const user = await currentUser();

    if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the course by courseId
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        isPublished: true,
      },
      include: {
        chapters: true, // Include chapters if needed
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Prepare the Stripe checkout session
    const line_items = [
      {
        quantity: 1,
        price_data: {
          currency: "USD",
          product_data: {
            name: course.title,
            description: course.description || "",
          },
          unit_amount: Math.round(course.price! * 100),
        },
      },
    ];

    let stripeCustomer = await db.stripeCustomer.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        stripeCustomerId: true,
      },
    });

    if (!stripeCustomer) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses?.[0]?.emailAddress,
      });

      stripeCustomer = await db.stripeCustomer.create({
        data: {
          userId: user.id,
          stripeCustomerId: customer.id,
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.stripeCustomerId,
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/search/preview/courses/${course.id}/chapters/${course.chapters[0]?.id}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/search/preview/courses/${course.id}/chapters/${course.chapters[0]?.id}?canceled=1`,
      metadata: {
        courseId: course.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[COURSE_CHECKOUT]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}