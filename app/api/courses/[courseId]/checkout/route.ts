// app/api/courses/[courseId]/checkout/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const user = await currentUser();

    if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the course with publisher info
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        isPublished: true,
      },
      include: {
        chapters: {
          orderBy: {
            position: 'asc'
          },
          take: 1
        },
        publisher: true
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Check for existing purchase
    const existingPurchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });

    if (existingPurchase) {
      return new NextResponse("Already purchased", { status: 400 });
    }

    // Get or create Stripe customer
    let stripeCustomer = await db.stripeCustomer.findUnique({
      where: { userId: user.id },
      select: { stripeCustomerId: true },
    });

    if (!stripeCustomer) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0].emailAddress,
        metadata: {
          userId: user.id,
        },
      });

      stripeCustomer = await db.stripeCustomer.create({
        data: {
          userId: user.id,
          stripeCustomerId: customer.id,
        },
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.stripeCustomerId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "USD",
            product_data: {
              name: course.title,
              description: course.description || undefined,
            },
            unit_amount: Math.round(course.price! * 100),
          },
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/search/preview/courses/${course.id}/chapters/${course.chapters[0]?.id}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/search/preview/courses/${course.id}/chapters/${course.chapters[0]?.id}?canceled=1`,
      metadata: {
        courseId: course.id,
        userId: user.id,
        publisherId: course.publisherId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[COURSE_CHECKOUT]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}