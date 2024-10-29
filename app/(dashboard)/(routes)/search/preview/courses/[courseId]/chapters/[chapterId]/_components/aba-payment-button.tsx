//app/(dashboard)/(routes)/search/preview/courses/[courseId]/chapters/[chapterId]/_components/aba-payment-button.tsx

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface ABAPaymentButtonProps {
  courseId: string;
  price: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ABAPaymentButton = ({
  courseId,
  price,
  isLoading,
  setIsLoading,
}: ABAPaymentButtonProps) => {
  const handleABAPayment = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/courses/${courseId}/aba-pay-way-checkout`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to initiate ABA payment");
      }

      const paymentData = await response.json();

      if (!paymentData.url) {
        throw new Error("ABA Payment URL missing in the response");
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
    } catch (error) {
      console.error("ABA payment failed:", error);
      toast.error("Something went wrong with ABA payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`w-full font-medium py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 shadow-md
        ${
          isLoading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
        }`}
      onClick={handleABAPayment}
      disabled={isLoading}
    >
      {isLoading ? (
        "Processing..."
      ) : (
        <>
          <ShoppingCart className="h-5 w-5 mr-2" />
          Pay with ABA • ${price.toFixed(2)}
        </>
      )}
    </motion.button>
  );
};

export default ABAPaymentButton;

//OLD CODE
