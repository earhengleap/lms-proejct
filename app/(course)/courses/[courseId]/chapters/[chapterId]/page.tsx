import { getChapter } from "@/actions/get-chapter";
import { getQuizzes } from "@/actions/get-quizzes";
import { Banner } from "@/components/banner";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { VideoPlayer } from "./_components/video-player";
import CourseEnrollButton from "./_components/course-enroll-button";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { File, Lock } from "lucide-react";
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
  params: {
    courseId: string; 
    chapterId: string;
  };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const {
    chapter,
    course,
    muxData,
    attachments,
    nextChapter,
    userProgress,
    purchase,
  } = await getChapter({
    userId,
    chapterId: params.chapterId,
    courseId: params.courseId,
  });

  if (!chapter || !course) {
    return redirect("/");
  }

  const quizzes = await getQuizzes(params.chapterId);

  const isLocked = !chapter.isFree && !purchase;
  const completeOnEnd = !!purchase && !userProgress?.isCompleted;

  return (
    <div>
      {userProgress?.isCompleted && (
        <Banner variant={"success"} label="You have completed this chapter." />
      )}
      {isLocked && (
        <Banner
          variant={"warning"}
          label="You need to purchase this course to watch this chapter."
        />
      )}
      <div className="flex flex-col max-w-2xl mx-auto pb-20">
        <div className="p-6">
          <VideoPlayer
            chapterId={params.chapterId}
            title={chapter.title}
            courseId={params.courseId}
            nextChapterId={nextChapter?.id}
            playbackId={muxData?.playbackId!}
            isLocked={isLocked}
            completedOnEnd={completeOnEnd}
          />
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <h2 className="text-2xl font-semibold">{chapter.title}</h2>
            {purchase ? (
              <CourseProgressButton
                chapterId={params.chapterId}
                courseId={params.courseId}
                nextChapterId={nextChapter?.id}
                isCompleted={!!userProgress?.isCompleted}
              />
            ) : (
              <CourseEnrollButton
                courseId={params.courseId}
                price={course.price!}
              />
            )}
          </div>
          <Separator className="my-4" />
          <div>
            <Preview value={chapter.description!} />
          </div>
          {!!attachments.length && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                {attachments.map((attachment) => (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={attachment.id}
                    className="flex items-center p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline"
                  >
                    <File className="mr-2" />
                    <p className="line-clamp-1">{attachment.name}</p>
                  </a>
                ))}
              </div>
            </>
          )}
          <Separator className="my-4" />
          <div className="w-full">
            <div className="flex justify-center w-full">
              {purchase ? (
                quizzes.length > 0 ? (
                  <Link
                    href={`/courses/${params.courseId}/chapters/${params.chapterId}/quizz/${quizzes[0].id}`}
                    className="w-full"
                  >
                    <Button className="w-full max-w-2xl flex items-center justify-center mx-auto">
                      Take a quiz: {quizzes[0].name}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full max-w-2xl flex items-center justify-center mx-auto"
                    disabled
                  >
                    No quiz available
                  </Button>
                )
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full max-w-2xl mx-auto">
                        <Button
                          className="w-full flex items-center justify-center cursor-pointer"
                          disabled
                          style={{ cursor: "pointer" }}
                        >
                          <Lock className="mr-2" /> Quiz Locked
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Purchase the course to unlock the quiz.</p>
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
