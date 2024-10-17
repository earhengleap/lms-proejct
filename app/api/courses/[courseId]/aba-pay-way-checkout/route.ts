//app/api/courses/[courseId]/aba-pay-way-checkout/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db"; // Import your db connection
import { currentUser } from "@clerk/nextjs/server"; // Import Clerk to get current user

// Constants from environment variables
const ABA_PAYWAY_API_KEY = process.env.ABA_PAYWAY_API_KEY!;
const ABA_PAYWAY_MERCHANT_ID = process.env.ABA_PAYWAY_MERCHANT_ID!;
const ABA_PAWWAY_API_URL = process.env.ABA_PAWWAY_API_URL!; // Moved all sensitive information to environment variables

// Function to generate HMAC hash using SHA512
function getHash(data: string): string {
  const hmac = crypto.createHmac("sha512", ABA_PAYWAY_API_KEY);
  hmac.update(data);
  return hmac.digest("base64");
}

// Named export for POST method
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

    const amount = course.price!.toFixed(2); // Use price as-is, no need to multiply by 100

    // Prepare ABA PayWay-specific parameters
    const items = Buffer.from(
      JSON.stringify([{ name: course.title, quantity: "1", amount }])
    ).toString("base64");

    const req_time = Math.floor(Date.now() / 1000).toString(); // Unique transaction timestamp
    const transactionId = req_time; // Unique transaction ID
    const firstName = user.firstName || "im"; // Customer's first name (default to im if not available)
    const lastName = user.lastName || "xing"; // Customer's last name (default to xing if not available)
    const phone = "0123456789"; // Placeholder for phone number, you can replace with actual
    const email = user.emailAddresses?.[0]?.emailAddress; // Customer's email
    const return_params = "imxing"; // Return params
    const type = "purchase"; // Transaction type
    const currency = "USD"; // Currency
    const payment_option = "cards"; // Payment option

    // Fix: Remove the additional shipping cost if it is not intended to be added to the course price
    const shipping = "0.00"; // Updated the shipping to 0.00 to avoid adding 0.50 extra to the course price

    const return_url = `${process.env.NEXT_PUBLIC_APP_URL}/search/preview/courses/${course.id}/chapters/${course.chapters[0]?.id}?success=1`; // Return URL
    const cancel_url = `${process.env.NEXT_PUBLIC_APP_URL}/search/preview/courses/${course.id}/chapters/${course.chapters[0]?.id}?canceled=1`; // Cancel URL
    const continue_success_url = `${process.env.NEXT_PUBLIC_APP_URL}/search/preview/courses/${course.id}/chapters/${course.chapters[0]?.id}`; // Continue URL
    const return_deeplink = `${process.env.NEXT_PUBLIC_APP_URL}/deeplink`; // Deeplink URL
    const custom_fields = Buffer.from(
      JSON.stringify({ order_ref: `PO-${transactionId}` })
    ).toString("base64"); // Custom fields

    // Concatenate the parameters in the correct order
    const hashData =
      req_time +
      ABA_PAYWAY_MERCHANT_ID +
      transactionId +
      amount +
      items +
      shipping + // Fix: shipping is now 0.00 instead of 0.50
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

    // Generate the hash
    const hash = getHash(hashData);

    // Return the JSON response with ABA PayWay URL and form data (in the correct order)
    return NextResponse.json({
      url: ABA_PAWWAY_API_URL,
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
  } catch (error) {
    console.error("[ABA_PAYWAY_CHECKOUT]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

//OLD CODE