"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { ReactNode } from "react";
import { Loader } from "lucide-react"; // Use an icon or your own loading spinner component

interface CourseEnrollButtonProps {
  price: number;
  courseId: string;
  className?: string;
  children?: ReactNode;
}

const CourseEnrollButton = ({
  price,
  courseId,
  className,
  children,
}: CourseEnrollButtonProps) => {
  // Add a state to manage the loading state
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true); // Set loading to true when starting the request

      // Make a request to your API to initiate Stripe Checkout
      const response = await axios.post(`/api/courses/${courseId}/checkout`);

      
      window.location.assign(response.data.url);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={isLoading} 
      className={className}
    >

      {isLoading ? (
        <div className="flex items-center">
          <Loader className="animate-spin mr-2 h-5 w-5" /> 
          Processing...
        </div>
      ) : (
        children || `Enroll for ${formatPrice(price)}`
      )}
    </Button>
  );
};

export default CourseEnrollButton;
