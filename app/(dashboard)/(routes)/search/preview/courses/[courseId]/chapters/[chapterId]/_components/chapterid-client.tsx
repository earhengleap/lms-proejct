"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, ArrowRight, ShoppingCart, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/login-modal";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

interface ChapterIdClientProps {
  chapterId: string;
  courseId: string;
  isLocked: boolean;
  price: number;
  hasPurchased: boolean;
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "stripe" | "abapay" | null
  >(null);
  const router = useRouter();

  const handleSignInClick = () => {
    setIsLoginModalOpen(true);
  };

  const handlePayment = async (paymentMethod: "stripe" | "abapay") => {
    try {
      setIsLoading(true);
      setLoadingPaymentMethod(paymentMethod);

      if (paymentMethod === "stripe") {
        const response = await axios.post(`/api/courses/${courseId}/checkout`, {
          paymentMethod: "stripe",
        });
        window.location.href = response.data.url;
      } else {
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

        if (!paymentData.url) {
          throw new Error("Payment URL missing in the response");
        }

        const form = document.createElement("form");
        form.method = "POST";
        form.action = paymentData.url;

        Object.keys(paymentData).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = paymentData[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      }
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingPaymentMethod(null);
    }
  };

  const PaymentOption = ({
    method,
    icon,
    label,
  }: {
    method: "stripe" | "abapay";
    icon: React.ReactNode;
    label: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex items-center p-3 border rounded-md cursor-pointer transition-all duration-300 ${
        selectedPaymentMethod === method
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-300"
      }`}
      onClick={() => setSelectedPaymentMethod(method)}
    >
      <div className="flex-shrink-0 mr-3">{icon}</div>
      <div className="flex-grow">
        <h4 className="font-medium text-sm text-gray-700">{label}</h4>
      </div>
      <div className="flex-shrink-0 ml-2">
        <div
          className={`w-4 h-4 rounded-full border ${
            selectedPaymentMethod === method
              ? "border-blue-500 bg-blue-500"
              : "border-gray-300"
          }`}
        >
          {selectedPaymentMethod === method && (
            <div className="w-2 h-2 bg-white rounded-full m-[3px]" />
          )}
        </div>
      </div>
    </motion.div>
  );

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
    return isLoading ? (
      "Processing..."
    ) : (
      <>
        {selectedPaymentMethod === "stripe" ? (
          <CreditCard className="h-5 w-5 mr-2" />
        ) : (
          <ShoppingCart className="h-5 w-5 mr-2" />
        )}
        Enroll Now • ${price.toFixed(2)}
      </>
    );
  };

  // Text animation
  const textVariants = {
    hidden: { opacity: 0 },
    visible: (i = 0) => ({
      opacity: 1,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  const description = isFirstChapter
    ? "Get a taste of the course content for free."
    : "Track your progress, watch with subtitles, change quality & speed, and more.";
  const words = description.split(" ");

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg p-6 border border-gray-200 shadow-lg flex flex-col h-full">
      <h2 className="font-bold text-2xl mb-4 text-gray-800">
        {isFirstChapter ? "Preview First Chapter" : "Ready to Learn?"}
      </h2>

      {/* Animated Description Text */}
      <div className="mb-6 text-sm leading-relaxed overflow-hidden">
        {words.map((word, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            style={{ display: "inline-block", marginRight: "4px" }}
          >
            {word}
          </motion.span>
        ))}
      </div>

      {/* Language Learning Quote */}
      <div className="p-4 bg-blue-100 rounded-lg mb-6 text-center">
        <p className="text-sm italic text-blue-800">
          &quot;Learn everything you can, anytime you can, from anyone you can;
          there will always come a time when you will be grateful you did.&quot;
        </p>
      </div>

      <div className="flex-grow flex flex-col justify-end">
        {!userId ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 shadow-md"
            onClick={handleSignInClick}
          >
            {buttonContent()}
          </motion.button>
        ) : hasPurchased ? (
          <Link href={`/courses/${courseId}/chapters/${chapterId}`} passHref>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 shadow-md"
            >
              {buttonContent()}
            </motion.button>
          </Link>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <PaymentOption
                method="stripe"
                icon={<CreditCard className="h-5 w-5 text-blue-500" />}
                label="Credit Card"
              />
              <PaymentOption
                method="abapay"
                icon={<ShoppingCart className="h-5 w-5 text-orange-500" />}
                label="ABA PayWay"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full font-medium py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 shadow-md ${
                isLoading || !selectedPaymentMethod
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              }`}
              onClick={() =>
                selectedPaymentMethod && handlePayment(selectedPaymentMethod)
              }
              disabled={isLoading || !selectedPaymentMethod}
            >
              {buttonContent()}
            </motion.button>
          </div>
        )}
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

export default ChapterIdClient;

//OLD
