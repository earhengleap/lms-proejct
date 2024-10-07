import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

 
const f = createUploadthing();
 
const handAuth = () => {
    const { userId } = auth();
    const isAuthorized = isTeacher(userId);

    if(!userId || !isAuthorized) throw new Error("Unauthorized") 
    return {userId};
}

export const ourFileRouter = {
    courseImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1}})
        .middleware(() => auth())
        .onUploadComplete(() => {}),
    courseAttachment: f(["text", "image", "video", "audio", "pdf"])
        .middleware(() => auth())
        .onUploadComplete(() => {}),
    chapterVideo: f({ video: { maxFileSize: "512GB", maxFileCount: 1}})
        .middleware(() => auth())
        .onUploadComplete(() => {}),


} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;