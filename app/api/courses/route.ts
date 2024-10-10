// app/api/courses/route.ts

import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
    try {
        const { userId } = auth();
        const user = await currentUser();
        const { title } = await req.json();
        
        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Determine publisher name based on user information
        let publisherName = "Unknown Publisher";
        if (user.firstName && user.lastName) {
            publisherName = `${user.firstName} ${user.lastName}`;
        } else if (user.firstName) {
            publisherName = user.firstName;
        } else if (user.emailAddresses && user.emailAddresses.length > 0) {
            publisherName = user.emailAddresses[0].emailAddress.split('@')[0];
        }

        // Find or create the publisher
        let publisher = await db.publisher.findFirst({
            where: { name: publisherName }
        });

        if (!publisher) {
            publisher = await db.publisher.create({
                data: { name: publisherName }
            });
        }

        const course = await db.course.create({
            data: {
                userId,
                title,
                publisherId: publisher.id
            },
            include: {
                publisher: true
            }
        });

        return NextResponse.json(course);
        
    } catch(error) {
        console.log("[COURSES]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
};