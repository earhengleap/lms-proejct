// File: app/api/check-user/route.ts

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    console.log("Starting check-user route");

    let user;
    try {
      user = await currentUser();
      console.log("currentUser call completed");
    } catch (clerkError) {
      console.error("Error fetching current user from Clerk:", clerkError);
      return new Response(JSON.stringify({ error: "Error fetching user data", details: clerkError instanceof Error ? clerkError.message : String(clerkError) }), {
        status: 500,
      });
    }

    if (!user) {
      console.log("No user found");
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
      });
    }

    console.log("User found:", user.id);

    const { id: clerkUserId, firstName, lastName, emailAddresses } = user;
    const email = emailAddresses[0]?.emailAddress;

    if (!email) {
      console.log("No email found for user:", clerkUserId);
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
      });
    }

    console.log("Processing user:", clerkUserId, email);

    try {
      // Try to find a user by Clerk userId
      let dbUser = await db.user.findUnique({
        where: { userId: clerkUserId },
      });

      if (dbUser) {
        console.log("Updating existing user:", dbUser.id);
        // Update existing user
        await db.user.update({
          where: { id: dbUser.id },
          data: {
            firstName: firstName ?? dbUser.firstName,
            lastName: lastName ?? dbUser.lastName,
            email: email,
          },
        });
      } else {
        console.log("Checking for user with email:", email);
        // Check if a user with this email already exists
        dbUser = await db.user.findUnique({
          where: { email: email },
        });

        if (dbUser) {
          console.log("Updating user with new Clerk ID:", dbUser.id);
          // Update the existing user with the new Clerk userId
          await db.user.update({
            where: { id: dbUser.id },
            data: {
              userId: clerkUserId,
              firstName: firstName ?? dbUser.firstName,
              lastName: lastName ?? dbUser.lastName,
            },
          });
        } else {
          console.log("Creating new user:", clerkUserId);
          // Create new user
          await db.user.create({
            data: {
              userId: clerkUserId,
              firstName: firstName ?? null,
              lastName: lastName ?? null,
              email: email,
            },
          });
        }
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      return new Response(JSON.stringify({ error: "Database operation failed", details: dbError instanceof Error ? dbError.message : String(dbError) }), {
        status: 500,
      });
    }

    console.log("User processing complete");
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Unhandled error in check-user route:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    if (typeof error === 'object' && error !== null && 'code' in error) {
      console.error("Error code:", (error as any).code);
    }
    return new Response(JSON.stringify({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }), {
      status: 500,
    });
  }
}