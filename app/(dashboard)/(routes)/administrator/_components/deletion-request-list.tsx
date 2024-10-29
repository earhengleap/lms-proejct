"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Book, FileText, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DeletionRequest {
  id: string;
  type: string;
  itemId: string;
  userId: string;
  userName: string;
  itemName: string;
  courseName?: string;
  status: string;
  createdAt: string;
}

export const DeletionRequestList = () => {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
      setRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== id)
      );
      router.refresh();
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <AnimatePresence mode="wait">
        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center h-[300px] text-muted-foreground"
          >
            <FileText className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">No pending deletion requests</p>
          </motion.div>
        ) : (
          <ul className="space-y-3">
            {requests.map((request) => (
              <motion.li
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group rounded-lg border border-border p-4 hover:shadow-md transition-all duration-200 bg-card"
              >
                <div className="flex flex-col space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {request.type === "course" ? (
                        <div className="p-2 rounded-full bg-blue-100">
                          <Book className="w-4 h-4 text-blue-600" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-full bg-green-100">
                          <FileText className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm text-muted-foreground">
                          {request.type.charAt(0).toUpperCase() +
                            request.type.slice(1)}{" "}
                          Deletion
                        </p>
                        <h3 className="font-semibold">{request.userName}</h3>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="pl-12">
                    <p className="text-sm text-muted-foreground mb-1">
                      Requesting to delete:
                    </p>
                    <p className="font-medium">
                      {request.type === "course"
                        ? request.itemName
                        : `${request.itemName} in "${request.courseName}"`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(request.id, "approved")}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(request.id, "rejected")}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
    </ScrollArea>
  );
};
