// app/actions/purchase.ts

import { db } from "@/lib/db";

export const checkAndCreatePurchase = async (userId: string, courseId: string) => {
    // Check if the user has already purchased the course
    const existingPurchase = await db.purchase.findUnique({
        where: {
            userId_courseId: {
                userId: userId,
                courseId: courseId,
            },
        },
    });

    if (existingPurchase) {
        // User has already purchased this course
        return { success: true, message: "Course already purchased" };
    }

    // If not, create a new purchase
    try {
        await db.purchase.create({
            data: {
                userId: userId,
                courseId: courseId,
            },
        });
        return { success: true, message: "Purchase successful" };
    } catch (error) {
        console.error("Error creating purchase:", error);
        return { success: false, message: "Failed to create purchase" };
    }
}