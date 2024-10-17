"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Trash2, Activity, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  publisherName: string | null;
  chapterName: string | null;
  courseName: string | null;
  itemType: string | null;
}

export const RecentActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [period, setPeriod] = useState("7days");
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/admin/activities?period=${period}`
      );
      setActivities(response.data);
    } catch (error) {
      console.error("Failed to fetch recent activities:", error);
      toast.error("Failed to fetch recent activities");
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleClear = async () => {
    if (activities.length === 0) return;

    try {
      await axios.delete("/api/admin/activities");
      setActivities([]);
      toast.success("Recent activities cleared successfully");
    } catch (error) {
      console.error("Failed to clear recent activities:", error);
      toast.error("Failed to clear recent activities");
    }
  };

  return (
    <Card className="p-6 shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-blue-500" />
          Recent Activities
        </h2>

        {/* Adjust the wrapping of Select and Buttons */}
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Select
            value={period}
            onValueChange={(value) => {
              setPeriod(value);
              fetchActivities();
            }}
          >
            <SelectTrigger className="w-full sm:w-auto text-sm sm:text-base">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
            </SelectContent>
          </Select>

          {/* Buttons wrapped in responsive layout */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Button
              onClick={fetchActivities}
              size="sm"
              variant="outline"
              className="w-full sm:w-auto transition-colors duration-300 ease-in-out hover:bg-blue-100 hover:text-blue-700 text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Button
              onClick={handleClear}
              size="sm"
              variant="destructive"
              disabled={activities.length === 0 || isLoading}
              className="w-full sm:w-auto transition-colors duration-300 ease-in-out hover:bg-red-700 text-sm sm:text-base"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-64"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </motion.div>
        ) : activities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 text-gray-500"
          >
            No recent activities to display.
          </motion.div>
        ) : (
          <ul className="space-y-4">
            <AnimatePresence>
              {activities.map((activity) => (
                <motion.li
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out"
                >
                  <div className="mb-2 sm:mb-0 sm:mr-4">
                    <p className="text-sm sm:text-base font-medium text-gray-800">
                      {activity.description}
                    </p>
                    {activity.publisherName && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        By: {activity.publisherName}
                      </p>
                    )}
                    {activity.courseName && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {activity.itemType === "chapter"
                          ? `Chapter: ${activity.chapterName} in Course: ${activity.courseName}`
                          : `Course: ${activity.courseName}`}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-start sm:items-end space-y-2">
                    <ActivityBadge type={activity.type} />
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </AnimatePresence>
    </Card>
  );
};

const ActivityBadge = ({ type }: { type: string }) => {
  const colors = {
    "Deletion Request": "bg-red-100 text-red-800",
    "Deletion Request Action": "bg-yellow-100 text-yellow-800",
    "Course Creation": "bg-green-100 text-green-800",
    "User Registration": "bg-blue-100 text-blue-800",
    "Course Publication": "bg-purple-100 text-purple-800",
  };
  return (
    <Badge
      className={`${
        colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
      } px-2 py-1 text-xs`}
    >
      {type}
    </Badge>
  );
};
