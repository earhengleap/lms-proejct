import { getChapter } from "@/actions/get-chapter";
import { getQuizzes } from "@/actions/get-quizzes";
import { Banner } from "@/components/banner";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { VideoPlayer } from "./_components/video-player";
import CourseEnrollButton from "./_components/course-enroll-button";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { File, Lock, PlayCircle } from "lucide-react";
import { CourseProgressButton } from "./_components/course-progress-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ChapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) => {
  const { userId } = auth();
  if (!userId) return redirect("/");

  const {
    chapter,
    course,
    attachments,
    nextChapter,
    userProgress,
    purchase,
  } = await getChapter({
    userId,
    chapterId: params.chapterId,
    courseId: params.courseId,
  });

  if (!chapter || !course) return redirect("/");

  const quizzes = await getQuizzes(params.chapterId);
  const isLocked = !chapter.isFree && !purchase;
  const completeOnEnd = !!purchase && !userProgress?.isCompleted;
  const isChapterCompleted = !!userProgress?.isCompleted;

  return (
    <div className="min-h-screen bg-gray-100">
      {isChapterCompleted && (
        <Banner variant="success" label="Chapter completed" />
      )}
      {isLocked && (
        <Banner
          variant="warning"
          label="Purchase required to access this chapter"
        />
      )}
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 transition-all duration-300 ease-in-out">
          <VideoPlayer
            chapterId={params.chapterId}
            title={chapter.title}
            courseId={params.courseId}
            nextChapterId={nextChapter?.id}
            videoUrl={chapter.videoUrl}
            isLocked={isLocked}
            completedOnEnd={completeOnEnd}
          />
        </div>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 ease-in-out">
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {chapter.title}
              </h1>
              {purchase ? (
                <CourseProgressButton
                  chapterId={params.chapterId}
                  courseId={params.courseId}
                  nextChapterId={nextChapter?.id}
                  isCompleted={isChapterCompleted}
                  userHasPurchased={!!purchase}
                />
              ) : (
                <CourseEnrollButton
                  courseId={params.courseId}
                  price={course.price!}
                />
              )}
            </div>
            <Separator />
            <div className="prose max-w-none">
              <Preview value={chapter.description!} />
            </div>
            {!!attachments.length && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Attachments</h2>
                <div className="grid gap-2">
                  {attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <File className="w-5 h-5 mr-2 text-blue-500" />
                      <span className="text-sm text-gray-700 truncate">
                        {attachment.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            <Separator />
            <div className="w-full">
              {purchase ? (
                quizzes.length > 0 ? (
                  isChapterCompleted ? (
                    <Link
                      href={`/courses/${params.courseId}/chapters/${params.chapterId}/quizz/${quizzes[0].id}`}
                    >
                      <Button className="w-full py-2 text-lg">
                        Take Quiz: {quizzes[0].name}
                      </Button>
                    </Link>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button className="w-full py-2 text-lg" disabled>
                            <PlayCircle className="w-5 h-5 mr-2" /> Quiz Locked
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Finish watching the video to unlock the quiz</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                ) : (
                  <Button className="w-full py-2 text-lg" disabled>
                    No quiz available
                  </Button>
                )
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button className="w-full py-2 text-lg" disabled>
                        <Lock className="w-5 h-5 mr-2" /> Quiz Locked
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Purchase the course to unlock the quiz</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterIdPage;
