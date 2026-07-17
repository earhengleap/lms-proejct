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
      <div className="flex justify-center items-center h-[260px]">
        <div className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-slate-500 animate-spin" />
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
            className="flex flex-col items-center justify-center h-[260px] text-slate-400"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              No pending deletion requests
            </p>
          </motion.div>
        ) : (
          <ul className="space-y-3">
            {requests.map((request) => (
              <motion.li
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group rounded-xl border border-slate-200/70 p-4 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex flex-col space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {request.type === "course" ? (
                        <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                          <Book className="w-4 h-4 text-sky-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-emerald-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          {request.type} deletion
                        </p>
                        <h3 className="font-semibold text-slate-900">
                          {request.userName}
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="pl-11">
                    <p className="text-xs text-slate-500 mb-1">
                      Requesting to delete:
                    </p>
                    <p className="text-sm font-medium text-slate-800">
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
                      className="rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(request.id, "rejected")}
                      className="rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
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
