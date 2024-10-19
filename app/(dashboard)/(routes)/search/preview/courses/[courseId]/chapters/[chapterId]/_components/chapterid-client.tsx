// app/(dashboard)/(routes)/search/preview/courses/[courseId]/chapters/[chapterId]/_components/chapterid-client.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, ArrowRight, ShoppingCart, CreditCard } from "lucide-react";
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
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState<
    string | null
  >(null);
  const router = useRouter();

  const handleSignInClick = () => {
    setIsLoginModalOpen(true);
  };

  // Handle Stripe Payment
  const handleStripePayment = async () => {
    try {
      setIsLoading(true);
      setLoadingPaymentMethod("stripe");
      const response = await axios.post(`/api/courses/${courseId}/checkout`, {
        paymentMethod: "stripe",
      });
      window.location.href = response.data.url;
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingPaymentMethod(null);
    }
  };

  const handleAbaPaywayPayment = async () => {
    try {
      setIsLoading(true);
      setLoadingPaymentMethod("abapay");

      const response = await fetch(
        `/api/courses/${courseId}/aba-pay-way-checkout`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to initiate payment");
      }

      const paymentData = await response.json();

      // Check if the payment URL is returned
      if (!paymentData.url) {
        throw new Error("Payment URL missing in the response");
      }

      // Dynamically create the form and submit it to ABA PayWay
      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentData.url;

      // Add hidden inputs based on the paymentData returned from the server
      Object.keys(paymentData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      });

      // Append the form to the body and submit it
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingPaymentMethod(null);
    }
  };

  // Function to handle the button content with payment method and price
  const buttonContent = (paymentMethod: "stripe" | "abapay") => {
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
        {paymentMethod === "stripe" ? (
          <CreditCard className="h-5 w-5 mr-2" />
        ) : (
          <ShoppingCart className="h-5 w-5 mr-2" />
        )}
        {isLoading && loadingPaymentMethod === paymentMethod
          ? "Processing..."
          : `Enroll with ${
              paymentMethod === "stripe" ? "Stripe" : "ABA PayWay"
            } ${price.toFixed(2)} USD`}
      </>
    );
  };

  return (
    <div className="w-full space-y-4 animate-slideIn">
      <div className="rounded-lg overflow-hidden transition-all duration-300 hover:shadow-sm">
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
                {buttonContent("stripe")}
              </Button>
            </Link>
          ) : (
            <div className="space-y-2">
              <Button
                className="w-full bg-white text-sky-600 font-semibold py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 hover:bg-sky-50 hover:translate-y-[-2px]"
                onClick={userId ? handleStripePayment : handleSignInClick}
                disabled={isLoading}
              >
                {buttonContent("stripe")}
              </Button>
              <Button
                className="w-full bg-white text-sky-600 font-semibold py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 hover:bg-sky-50 hover:translate-y-[-2px]"
                onClick={userId ? handleAbaPaywayPayment : handleSignInClick}
                disabled={isLoading}
              >
                {buttonContent("abapay")}
              </Button>
            </div>
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

//NEW CODE TAHT CAN WORK WITH ABA PAYWAY
