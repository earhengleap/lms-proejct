import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";

const muxConfig = {
    tokenID: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
};

const mux = new Mux(muxConfig);

export async function DELETE (
    req: Request,
    { params } : { params :{ courseId: string } }
) {
    try {
        const { userId } = auth();

        if(!userId || !isTeacher(userId)) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const coures = await db.course.findUnique({
            where: {
                id: params.courseId,
                userId
            },
            include: {
                chapters: {
                    include: {
                        muxData: true
                    }
                }
            }
        })

        if (!coures) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        for (const chapter of coures.chapters) {
            if (chapter.muxData?.assetId) {
                await mux.video.assets.delete(chapter.muxData.assetId);
            }
        }

        const deletedCourse = await db.course.delete({
            where: {
                id: params.courseId
            }
        })

        return NextResponse.json(deletedCourse);

    } catch (error) {
        console.log("[COURSES_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500})
    }
}


export async function PATCH (
req: Request,
{
    params
} : {
    params: {
        courseId: string
    }
}
) {
    try {
        const { userId } = auth();
        const { courseId } = params;
        const values = await req.json();

        if ( !userId || !isTeacher(userId)) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const course = await db.course.update({
            where: {
                id: courseId,
                userId,
            },
            data: {
                ...values,
            }
        })
        return NextResponse.json(course);
    } catch (error) {
        console.log("[COURSE_ID]", error);
        return new NextResponse("Internal Error", { status: 500});
    }
}