"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
import {
  Trash2,
  Activity,
  RefreshCw,
  Clock,
  User,
  Book,
  BookOpen,
} from "lucide-react";
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

const TIME_PERIODS = {
  "7days": "Last 7 days",
  "30days": "Last 30 days",
  "3months": "Last 3 months",
} as const;

const ACTIVITY_COLORS = {
  "Deletion Request": {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    icon: Trash2,
  },
  "Deletion Request Action": {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-200",
    icon: Activity,
  },
  "Course Creation": {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    icon: Book,
  },
  "User Registration": {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    icon: User,
  },
  "Course Publication": {
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
    icon: BookOpen,
  },
} as const;

export const RecentActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [period, setPeriod] = useState("7days");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Loading state:", isLoading);
  }, [isLoading]);

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      // Add artificial delay to test loading state
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
      toast.success("Activities cleared successfully");
    } catch (error) {
      console.error("Failed to clear activities:", error);
      toast.error("Failed to clear activities");
    }
  };

  return (
    <div className="h-full bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                Activities
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Real-time</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Select value={period} onValueChange={(value) => setPeriod(value)}>
              <SelectTrigger className="w-[140px] h-8 text-sm bg-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIME_PERIODS).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-sm">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                onClick={fetchActivities}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Refresh
              </Button>

              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                disabled={activities.length === 0 || isLoading}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <LoadingState />
        ) : activities.length === 0 ? (
          <EmptyState />
        ) : (
          <ActivityList activities={activities} />
        )}
      </div>
    </div>
  );
};

const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex justify-center items-center h-[400px]"
  >
    <div
      className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"
      style={{ animationDuration: "1s" }}
    />
  </motion.div>
);

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center h-48 gap-3"
  >
    <div className="p-3 rounded-full bg-gray-50">
      <Activity className="w-6 h-6 text-gray-400" />
    </div>
    <p className="text-sm text-gray-500">No activities to display</p>
  </motion.div>
);

const ActivityList = ({ activities }: { activities: Activity[] }) => (
  <ul className="p-4 space-y-3">
    <AnimatePresence initial={false}>
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </AnimatePresence>
  </ul>
);

const ActivityItem = ({ activity }: { activity: Activity }) => {
  const activityConfig = ACTIVITY_COLORS[
    activity.type as keyof typeof ACTIVITY_COLORS
  ] || {
    bg: "bg-gray-50",
    text: "text-gray-800",
    border: "border-gray-200",
    icon: Activity,
  };

  const IconComponent = activityConfig.icon;

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${activityConfig.bg} rounded-lg p-3 border ${activityConfig.border} transition-all duration-200`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${activityConfig.bg}`}>
          <IconComponent className={`w-4 h-4 ${activityConfig.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 mb-1">
            {activity.description}
          </p>
          <ActivityDetails activity={activity} />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge
            className={`${activityConfig.bg} ${activityConfig.text} border ${activityConfig.border} px-2 py-0.5 text-xs`}
          >
            {activity.type}
          </Badge>
          <time className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(activity.createdAt), {
              addSuffix: true,
            })}
          </time>
        </div>
      </div>
    </motion.li>
  );
};

const ActivityDetails = ({ activity }: { activity: Activity }) => (
  <div className="space-y-1">
    {activity.publisherName && (
      <DetailItem label="Author" value={activity.publisherName} />
    )}
    {activity.courseName && (
      <DetailItem label="Course" value={activity.courseName} />
    )}
    {activity.chapterName && (
      <DetailItem label="Chapter" value={activity.chapterName} />
    )}
  </div>
);

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <p className="text-xs text-gray-600 flex items-center gap-2">
    <span className="text-gray-500">{label}:</span>
    <span className="truncate">{value}</span>
  </p>
);
