//app/(dashboard)/(routes)/search/preview/courses/[courseId]chapters/[chapterId]/page.tsx

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { VideoPlayer } from "@/app/(course)/courses/[courseId]/chapters/[chapterId]/_components/video-player";
import { CourseProgress } from "@/components/course-progress";
import { IconBadge } from "@/components/icon-badge";
import { BookOpen } from "lucide-react";
import ChapterIdClient from "./_components/chapterid-client";
import { Preview } from "@/components/preview";
import { Comments } from "./_components/comments";

interface ChapterIdPageProps {
  params: {
    courseId: string;
    chapterId: string;
  };
}

const ChapterIdPage = async ({ params }: ChapterIdPageProps) => {
  const { userId } = auth();
  const { courseId, chapterId } = params;

  let chapter;
  try {
    chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      include: {
        course: {
          include: {
            chapters: {
              include: {
                userProgress: {
                  where: {
                    userId: userId || "",
                  },
                },
              },
              orderBy: {
                position: "asc",
              },
            },
            category: true,
            purchases: {
              where: {
                userId: userId || "",
              },
            },
          },
        },
        muxData: true,
      },
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>Unable to connect to the database. Please try again later.</p>
      </div>
    );
  }

  if (!chapter) {
    return redirect("/");
  }

  const isFirstChapter = chapter.position === 1;
  const isLocked = !chapter.isFree && !isFirstChapter;
  const price = chapter.course.price || 0;
  const hasPurchased = userId ? chapter.course.purchases.length > 0 : false;

  const chaptersLength = chapter.course.chapters.length;
  const completedChapters = hasPurchased
    ? chapter.course.chapters.filter((ch) => ch.userProgress?.[0]?.isCompleted)
        .length
    : 0;

  const progress = hasPurchased
    ? Math.round((completedChapters / chaptersLength) * 100)
    : 0;

  const userProgress = chapter.course.chapters.find((ch) => ch.id === chapterId)
    ?.userProgress?.[0];

  const nextChapter = chapter.course.chapters.find(
    (ch) => ch.position === chapter.position + 1
  );

  return (
    <div className="flex flex-col max-w-7xl mx-auto pb-20">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <VideoPlayer
          chapterId={chapterId}
          title={chapter.title}
          courseId={courseId}
          nextChapterId={nextChapter?.id}
          playbackId={chapter.muxData?.playbackId!}
          isLocked={isLocked && !hasPurchased}
          completedOnEnd={
            hasPurchased && !!userId && !userProgress?.isCompleted
          }
        />
      </div>
      <div className="mt-8 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 border transition-all duration-300 hover:shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="font-bold text-2xl text-gray-800 transition-colors duration-300 hover:text-sky-600 mb-2 sm:mb-0">
                {chapter.title}
              </h3>
              <div className="flex items-center gap-x-2 text-sm text-gray-500">
                <IconBadge size="sm" icon={BookOpen} />
                <span>
                  {chaptersLength}{" "}
                  {chaptersLength === 1 ? "Chapter" : "Chapters"}
                </span>
              </div>
            </div>
            <div className="text-md text-gray-600 mb-4 leading-relaxed">
              <Preview value={chapter.description || ""} />
            </div>
            {chapter.course.category && (
              <div className="inline-block bg-sky-100 text-sky-800 rounded-full px-3 py-1 text-xs font-semibold mr-2 mb-4">
                {chapter.course.category.name}
              </div>
            )}
            <div className="mt-4">
              <CourseProgress
                variant={progress === 100 ? "success" : "default"}
                size="sm"
                value={progress}
              />
              {!userId && (
                <p className="text-sm text-gray-500 mt-2 italic">
                  Sign in to track your progress
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <ChapterIdClient
            chapterId={chapterId}
            courseId={courseId}
            isLocked={isLocked}
            price={price}
            hasPurchased={hasPurchased}
            progress={progress}
            userProgress={userProgress}
            userId={userId}
            courseTitle={chapter.course.title}
            courseDescription={chapter.course.description}
            isFirstChapter={isFirstChapter}
          />
        </div>
      </div>
      <div className="mt-8 px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white border rounded-md p-6 transition-all duration-300 hover:shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          <Comments chapterId={chapterId} />
        </div>
      </div>
    </div>
  );
};

export default ChapterIdPage;
