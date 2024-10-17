// app/dashboard/(routes)/teacher/courses/[courseId]/_components/actions.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Trash, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { NotificationModal } from "./notification-modal";

interface ActionsProps {
  disabled: boolean;
  courseId: string;
  isPublished: boolean;
  initialPendingStatus: boolean;
}

export const Actions = ({
  disabled,
  courseId,
  isPublished,
  initialPendingStatus,
}: ActionsProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(initialPendingStatus);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(
    null
  );
  const [isApproved, setIsApproved] = useState(false);

  // Updated useEffect to handle initial pending status
  useEffect(() => {
    const checkNotification = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/notification`);
        const data = await response.json();
        if (data.message) {
          setNotificationMessage(data.message);
          if (data.message.includes("approved")) {
            setIsApproved(true);
            setIsPending(false);
          } else if (data.message.includes("rejected")) {
            setIsPending(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch notification:", error);
      }
    };

    const intervalId = setInterval(checkNotification, 5000);

    return () => clearInterval(intervalId);
  }, [courseId]);

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        await axios.patch(`/api/courses/${courseId}/unpublish`);
        toast.success("Course unpublished.");
      } else {
        await axios.patch(`/api/courses/${courseId}/publish`);
        toast.success("Course published.");
        confetti.onOpen();
      }
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.post(`/api/courses/${courseId}/deletion-request`);
      toast.success("Deletion request submitted for approval.");
      setIsPending(true);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const onCancelRequest = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/courses/${courseId}/deletion-request`);
      toast.success("Deletion request cancelled.");
      setIsPending(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to cancel deletion request.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeNotification = () => {
    setNotificationMessage(null);
    if (isApproved) {
      router.push("/teacher/courses");
    }
  };

  return (
    <>
      <div className="flex items-center gap-x-2">
        <Button
          disabled={disabled || isLoading || isApproved}
          variant="outline"
          size="sm"
          onClick={onClick}
        >
          {isPublished ? "Unpublish" : "Publish"}
        </Button>
        <AnimatePresence mode="wait">
          {!isPending && !isApproved && (
            <motion.div
              key="delete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <ConfirmModal
                onConfirm={onDelete}
                title="Request Course Deletion"
                description="Are you sure you want to request deletion of this course? This action can be cancelled later if needed."
              >
                <Button size="sm" disabled={isLoading} variant="destructive">
                  <Trash className="h-4 w-4" />
                </Button>
              </ConfirmModal>
            </motion.div>
          )}
          {isPending && !isApproved && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-x-2"
            >
              <Button size="sm" disabled={true} variant="outline">
                Pending
              </Button>
              <ConfirmModal
                onConfirm={onCancelRequest}
                title="Cancel Deletion Request"
                description="Are you sure you want to cancel the deletion request for this course?"
                confirmText="Yes, Cancel Request"
              >
                <Button size="sm" variant="destructive" disabled={isLoading}>
                  <X className="h-4 w-4" />
                </Button>
              </ConfirmModal>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <NotificationModal
        isOpen={!!notificationMessage}
        onClose={closeNotification}
        message={notificationMessage || ""}
      />
    </>
  );
};
