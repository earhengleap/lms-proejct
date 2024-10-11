"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, ArrowRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/login-modal";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";

interface ChapterIdClientProps {
  chapterId: string;
  courseId: string;
  isLocked: boolean;
  price: number;
  hasPurchased: boolean;
  progress: number | null;
  userProgress: any;
  userId: string | null;
  courseTitle: string;
  courseDescription: string | null | undefined;
  isFirstChapter: boolean;
}

const ChapterIdClient: React.FC<ChapterIdClientProps> = ({
  chapterId,
  courseId,
  isLocked,
  price,
  hasPurchased,
  userProgress,
  userId,
  isFirstChapter,
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignInClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleEnrollClick = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`/api/courses/${courseId}/checkout`);
      window.location.href = response.data.url;
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const buttonContent = () => {
    if (!userId) {
      return (
        <>
          <Play className="h-5 w-5 mr-2" />
          Sign in to Watch
        </>
      );
    }
    if (hasPurchased) {
      return userProgress?.isCompleted ? (
        <>
          <ArrowRight className="h-5 w-5 mr-2" />
          Continue Learning
        </>
      ) : (
        <>
          <Play className="h-5 w-5 mr-2" />
          Start Watching
        </>
      );
    }
    return (
      <>
        <ShoppingCart className="h-5 w-5 mr-2" />
        {isLoading ? "Processing..." : `Enroll for $${price}`}
      </>
    );
  };

  return (
    <div className="w-full space-y-4 animate-slideIn">
      <div className="rounded-lg overflow-hidden transition-all duration-300 hover:shadow-sm">
        {/* Updated gradient background with Beach gradient */}
        <div className="bg-gradient-to-br from-[#4FACFE] to-[#00F2FE] p-6 text-white border">
          <h2 className="font-bold text-2xl mb-3 transition-transform duration-300 hover:translate-x-1">
            {isFirstChapter
              ? "Watch the First Chapter Free!"
              : "Ready to start learning?"}
          </h2>
          <p className="text-sm mb-6 text-sky-100">
            {isFirstChapter
              ? "Enjoy the first chapter and decide if this course is right for you."
              : "Track your progress, watch with subtitles, change quality & speed, and more."}
          </p>

          {userId && hasPurchased ? (
            <Link href={`/courses/${courseId}/chapters/${chapterId}`} passHref>
              <Button className="w-full bg-white text-sky-600 font-semibold py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 hover:bg-sky-50 hover:translate-y-[-2px]">
                {buttonContent()}
              </Button>
            </Link>
          ) : (
            <Button
              className="w-full bg-white text-sky-600 font-semibold py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 hover:bg-sky-50 hover:translate-y-[-2px]"
              onClick={userId ? handleEnrollClick : handleSignInClick}
              disabled={isLoading}
            >
              {buttonContent()}
            </Button>
          )}
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

export default ChapterIdClient;