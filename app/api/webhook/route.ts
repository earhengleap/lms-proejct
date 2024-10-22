// app/api/webhook/route.ts

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  console.log("Received Stripe event:", event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("Session Metadata:", session.metadata);

    const userId = session?.metadata?.userId;
    const courseId = session?.metadata?.courseId;
    const paymentIntentId = session?.payment_intent as string;
    const amountTotal = session?.amount_total;

    if (!userId || !courseId || !paymentIntentId || !amountTotal) {
      console.error("Webhook Error: Missing required data");
      return new NextResponse("Missing required data", { status: 400 });
    }

    try {
      // Get course and publisher information
      const course = await db.course.findUnique({
        where: { id: courseId },
        include: { publisher: true }
      });

      if (!course || !course.publisher) {
        throw new Error("Course or publisher not found");
      }

      const amount = amountTotal / 100; // Convert from cents to dollars
      const royaltyAmount = amount * 0.10; // 10% royalty

      // Create or update purchase record
      const purchase = await db.purchase.upsert({
        where: {
          userId_courseId: {
            userId: userId,
            courseId: courseId,
          }
        },
        create: {
          userId: userId,
          courseId: courseId,
          publisherId: course.publisherId,
          amount: amount,
          transactionId: paymentIntentId,
          paymentStatus: "completed",
          paymentMethod: "stripe",
          royaltyAmount: royaltyAmount,
        },
        update: {
          paymentStatus: "completed",
          transactionId: paymentIntentId,
        },
      });

      // Update publisher's revenue and royalty
      await db.publisher.update({
        where: { id: course.publisherId },
        data: {
          totalRevenue: { increment: amount },
          royalty: { increment: royaltyAmount },
        },
      });

      // Update or create publisher's wallet
      await db.wallet.upsert({
        where: { publisherId: course.publisherId },
        create: {
          publisherId: course.publisherId,
          totalRevenue: amount,
          royalty: royaltyAmount,
          availableBalance: amount - royaltyAmount,
          pendingBalance: 0,
          withdrawnRevenue: 0,
        },
        update: {
          totalRevenue: { increment: amount },
          royalty: { increment: royaltyAmount },
          availableBalance: { increment: amount - royaltyAmount },
        },
      });

      console.log("Purchase created/updated:", purchase);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error("Error processing purchase:", error.message);
      return new NextResponse(error.message, { status: 500 });
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    try {
      await db.purchase.updateMany({
        where: {
          transactionId: paymentIntent.id,
        },
        data: {
          paymentStatus: "failed",
        },
      });
    } catch (error: any) {
      console.error("Error updating failed payment:", error.message);
    }
  }

  return new NextResponse(null, { status: 200 });
}