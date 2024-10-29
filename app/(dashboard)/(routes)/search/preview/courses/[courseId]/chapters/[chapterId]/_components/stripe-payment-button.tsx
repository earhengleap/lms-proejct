// StripePaymentButton.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface StripePaymentButtonProps {
  courseId: string;
  price: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const StripePaymentButton = ({ 
  courseId, 
  price, 
  isLoading, 
  setIsLoading 
}: StripePaymentButtonProps) => {
  const handleStripePayment = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`/api/courses/${courseId}/checkout`, {
        paymentMethod: "stripe",
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Stripe payment failed:", error);
      toast.error("Something went wrong with Stripe payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`w-full font-medium py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 shadow-md
        ${isLoading 
          ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
          : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
        }`}
      onClick={handleStripePayment}
      disabled={isLoading}
    >
      {isLoading ? (
        "Processing..."
      ) : (
        <>
          <CreditCard className="h-5 w-5 mr-2" />
          Pay with Stripe • ${price.toFixed(2)}
        </>
      )}
    </motion.button>
  );
};

export default StripePaymentButton;