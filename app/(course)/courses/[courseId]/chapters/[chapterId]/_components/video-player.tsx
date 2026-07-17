"use client";

import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useConfettiStore } from "@/hooks/use-confetti-store";

interface VideoPlayerProps {
  videoUrl: string | null;
  courseId: string;
  chapterId: string;
  nextChapterId?: string | null;
  isLocked: boolean;
  completedOnEnd: boolean;
  title: string;
}

export const VideoPlayer = ({
  videoUrl,
  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completedOnEnd,
  title,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const confetti = useConfettiStore();

  const onEnd = async () => {
    try {
      if (completedOnEnd) {
        await axios.put(
          `/api/courses/${courseId}/chapters/${chapterId}/progress`,
          {
            isCompleted: true,
          }
        );

        if (!nextChapterId) {
          confetti.onOpen();
        }

        toast.success("Progress updated");
        router.refresh();

        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-md shadow-lg bg-slate-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full aspect-video"
      >
        {!isReady && !isLocked && videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        )}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-secondary">
            <div className="text-center">
              <Lock className="h-8 w-8 mx-auto mb-2" />
              <p className="font-semibold">This chapter is locked</p>
            </div>
          </div>
        )}
        {!isLocked && videoUrl && (
          <video
            src={videoUrl}
            controls
            playsInline
            onCanPlay={() => setIsReady(true)}
            onEnded={onEnd}
            className={cn(
              "absolute inset-0 h-full w-full",
              !isReady && "opacity-0"
            )}
          />
        )}
        {!isLocked && !videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-secondary">
            <p className="font-semibold">No video available</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
