"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Book, FileText, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation"; // Import useRouter

interface DeletionRequest {
  id: string;
  type: string; // "chapter" or "course"
  itemId: string;
  userId: string;
  userName: string;
  itemName: string;
  courseName?: string; // Optional for chapter requests to display course info
  status: string;
  createdAt: string;
}

export const DeletionRequestList = () => {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter(); // Add useRouter to handle page refresh

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/admin/deletion-requests");
      setRequests(response.data);
    } catch (error) {
      toast.error("Failed to fetch deletion requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    try {
      await axios.patch("/api/admin/deletion-requests", { id, action });
      toast.success(`Request ${action} successfully`);

      // Remove the request from the list after approval/rejection
      setRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== id)
      );

      // Trigger a page refresh to update the teacher/courses/${courseId} view
      router.refresh(); // Use router.refresh to reload the page after action
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center py-8 text-gray-500"
        >
          No pending deletion requests.
        </motion.div>
      ) : (
        <ul className="space-y-4">
          {requests.map((request) => (
            <motion.li
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-start space-x-3 mb-4 md:mb-0">
                  {request.type === "course" ? (
                    <Book className="w-6 h-6 text-blue-500 mt-1" />
                  ) : (
                    <FileText className="w-6 h-6 text-green-500 mt-1" />
                  )}
                  <div>
                    <p className="font-semibold text-lg">{request.userName}</p>
                    <p className="text-sm text-gray-600">
                      Requested to delete {request.type}:
                    </p>
                    <p className="text-md font-medium text-gray-800">
                      {request.type === "course"
                        ? request.itemName // For courses, show just the item name
                        : request.courseName // For chapters, display the chapter in the course
                        ? `${request.itemName} in "${request.courseName}"`
                        : request.itemName}{" "}
                      {/* Fallback in case courseName is undefined */}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Requested on:{" "}
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(request.id, "approved")}
                    className="transition-colors duration-300 ease-in-out hover:bg-green-100 hover:text-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAction(request.id, "rejected")}
                    className="transition-colors duration-300 ease-in-out hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </AnimatePresence>
  );
};
