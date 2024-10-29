// app/api/courses/[courseId]/aba-pay-way-checkout/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db"; // Import your db connection
import { currentUser } from "@clerk/nextjs/server"; // Import Clerk to get current user

// Constants from environment variables
const ABA_PAYWAY_API_KEY = process.env.ABA_PAYWAY_API_KEY!;
const ABA_PAYWAY_MERCHANT_ID = process.env.ABA_PAYWAY_MERCHANT_ID!;
const ABA_PAWWAY_API_URL = process.env.ABA_PAWWAY_API_URL!;

// Function to generate HMAC hash using SHA512
function getHash(data: string): string {
  const hmac = crypto.createHmac("sha512", ABA_PAYWAY_API_KEY);
  hmac.update(data);
  return hmac.digest("base64");
}

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const user = await currentUser();

    if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch course details
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        isPublished: true,
      },
      include: {
        chapters: true,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const amount = course.price!.toFixed(2); // Course price
    const items = Buffer.from(
      JSON.stringify([{ name: course.title, quantity: "1", amount }])
    ).toString("base64");

    const req_time = Math.floor(Date.now() / 1000).toString(); // Transaction timestamp
    const transactionId = req_time; // Transaction ID (you can also generate more unique IDs)
    const firstName = user.firstName || "im";
    const lastName = user.lastName || "xing";
    const phone = "0123456789"; // Placeholder phone number
    const email = user.emailAddresses?.[0]?.emailAddress; // User email
    const return_params = "imxing";
    const type = "purchase";
    const currency = "USD";
    const payment_option = "abapay";
    const shipping = "0.00"; // Shipping cost is set to 0.00

    // Return URLs
    const return_url = `${process.env.NEXT_PUBLIC_APP_URL}/search/preview/courses/${course.id}/chapters/${course.chapters[0]?.id}?success=1`;
    const cancel_url = `${process.env.NEXT_PUBLIC_APP_URL}/search/preview/courses/${course.id}/chapters/${course.chapters[0]?.id}?canceled=1`;
    const continue_success_url = `${process.env.NEXT_PUBLIC_APP_URL}/search/preview/courses/${course.id}/chapters/${course.chapters[0]?.id}`;
    const return_deeplink = `${process.env.NEXT_PUBLIC_APP_URL}/deeplink`;

    // Custom fields for transaction
    const custom_fields = Buffer.from(
      JSON.stringify({ order_ref: `PO-${transactionId}` })
    ).toString("base64");

    // Concatenate parameters for hashing
    const hashData =
      req_time +
      ABA_PAYWAY_MERCHANT_ID +
      transactionId +
      amount +
      items +
      shipping +
      firstName +
      lastName +
      email +
      phone +
      type +
      payment_option +
      return_url +
      cancel_url +
      continue_success_url +
      return_deeplink +
      currency +
      custom_fields +
      return_params;

    // Generate the HMAC hash
    const hash = getHash(hashData);

    // Simulate a successful payment response from ABA PayWay
    const isPaymentSuccessful = true;

    if (isPaymentSuccessful) {
      // Assuming the royalty amount is 10% of the course price
      const royaltyAmount = parseFloat(amount) * 0.10; // 10% royalty

      // Create a purchase record in the database
      await db.purchase.create({
        data: {
          userId: user.id,
          courseId: course.id,
          amount: parseFloat(amount),
          transactionId: transactionId,
          paymentStatus: "completed", // Mark payment as completed
          paymentMethod: "abapay",    // Payment method as ABA PayWay
          royaltyAmount: royaltyAmount, // Set the royalty amount
        },
      });

      // Respond with success and redirect URLs
      return NextResponse.json({
        url: ABA_PAWWAY_API_URL, // Ensure this is the correct URL
        hash,
        tran_id: transactionId,
        amount,
        firstname: firstName,
        lastname: lastName,
        phone,
        email,
        items,
        return_params,
        shipping,
        currency,
        type,
        merchant_id: ABA_PAYWAY_MERCHANT_ID,
        req_time,
        payment_option,
        return_url,
        cancel_url,
        continue_success_url,
        return_deeplink,
        custom_fields,
      });
      
    }

    // If payment fails, return an error
    return new NextResponse("Payment failed", { status: 400 });
  } catch (error) {
    console.error("[ABA_PAYWAY_CHECKOUT]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

//OLD CODE