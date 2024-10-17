// app/(course)/courses/[courseId]/chapters/[chapterId]/_components/course-progress-button.tsx

"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";

interface CourseProgressButtonProps {
  chapterId: string;
  courseId: string;
  isCompleted?: boolean;
  nextChapterId?: string;
  userHasPurchased: boolean;
}

export const CourseProgressButton = ({
  chapterId,
  courseId,
  isCompleted,
  nextChapterId,
  userHasPurchased,
}: CourseProgressButtonProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const startTime = Date.now();

      await axios.put(
        `/api/courses/${courseId}/chapters/${chapterId}/progress`,
        {
          isCompleted: !isCompleted,
        }
      );

      const minLoadingTime = 1500; // 1.5 seconds minimum loading time
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      setTimeout(() => {
        if (!isCompleted) {
          confetti.onOpen();
        }

        toast.success("Progress updated");

        setTimeout(() => {
          if (!isCompleted && nextChapterId) {
            router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
          } else {
            router.refresh();
          }
          setIsLoading(false);
        }, 500); // Delay after confetti before navigation/refresh
      }, remainingTime);
    } catch (error) {
      toast.error("Something went wrong");
      setIsLoading(false);
    }
  };

  if (!userHasPurchased) {
    return null;
  }

  const variants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={variants}
    >
      <Button
        onClick={onClick}
        disabled={isLoading}
        type="button"
        variant={isCompleted ? "outline" : "success"}
        className="w-full md:w-auto transition-all duration-300 ease-in-out"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Updating...
          </>
        ) : isCompleted ? (
          <>
            <XCircle className="h-4 w-4 mr-2" />
            Mark as incomplete
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as complete
          </>
        )}
      </Button>
    </motion.div>
  );
};
