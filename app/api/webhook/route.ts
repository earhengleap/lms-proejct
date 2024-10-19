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

  // Log the event type to ensure you're getting the correct event
  console.log("Received Stripe event:", event.type);

  // Only handle `checkout.session.completed`
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Log the session metadata to ensure it's being passed correctly
    console.log("Session Metadata:", session.metadata);

    const userId = session?.metadata?.userId;
    const courseId = session?.metadata?.courseId;
    const paymentIntentId = session?.payment_intent as string;
    const amountTotal = session?.amount_total as number; // The amount paid in cents
    const paymentStatus = session?.payment_status; // Stripe payment status

    // Log all key data to verify they exist
    console.log("User ID:", userId);
    console.log("Course ID:", courseId);
    console.log("Payment Intent ID:", paymentIntentId);
    console.log("Amount Total (cents):", amountTotal);
    console.log("Payment Status:", paymentStatus);

    // Ensure all required fields are present before creating the purchase record
    if (!userId || !courseId || !paymentIntentId || !amountTotal || !paymentStatus) {
      console.error("Webhook Error: Missing data for purchase creation");
      return new NextResponse(`Webhook Error: Missing data`, { status: 400 });
    }

    // Convert amount from cents to USD
    const amount = amountTotal / 100;

    try {
      // Create the purchase record in the database
      const newPurchase = await db.purchase.create({
        data: {
          courseId: courseId,
          userId: userId,
          amount: amount, // Amount paid
          transactionId: paymentIntentId, // The payment intent ID as transactionId
          paymentStatus: paymentStatus, // Stripe's payment status (e.g., "paid")
          paymentMethod: "stripe", // Hardcode "stripe" for this method
        },
      });

      // Log the newly created purchase to ensure it is created
      console.log("New Purchase Created:", newPurchase);
    } catch (error: any) {
      console.error("Error creating purchase record:", error.message);
      return new NextResponse(`Purchase creation error: ${error.message}`, { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
  } else {
    // Log unhandled event types
    console.log(`Unhandled event type: ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}
