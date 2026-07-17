"use client";

import { useState, useCallback } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Bell, Check, Clock, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { timeAgo } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Notifications = ({ userId }: { userId: string }) => {
  const notifications = useQuery(api.notifications.getNotifications, {
    userId,
  });
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsRead = useMutation(
    api.notifications.markAllNotificationsAsRead
  );

  const [dismissedIds, setDismissedIds] = useState<Id<"notifications">[]>([]);

  const visibleNotifications =
    notifications?.filter((n) => !dismissedIds.includes(n._id)) ?? [];

  const count = visibleNotifications.length;

  const dismiss = useCallback(
    async (id: Id<"notifications">) => {
      setDismissedIds((prev) => [...prev, id]);
      await markAsRead({ id });
    },
    [markAsRead]
  );

  const dismissAll = useCallback(async () => {
    const ids = visibleNotifications.map((n) => n._id);
    setDismissedIds((prev) => [...prev, ...ids]);
    await markAllAsRead({ userId });
  }, [visibleNotifications, markAllAsRead, userId]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200 group">
          <Bell
            size={18}
            className="text-slate-500 group-hover:text-slate-700 transition-colors"
          />
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white px-1"
              >
                {count > 9 ? "9+" : count}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden"
        align="end"
        alignOffset={-8}
        side="bottom"
        sideOffset={8}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Notifications
          </h3>
          {count > 0 && (
            <button
              onClick={dismissAll}
              className="text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="h-px bg-slate-100" />

        {/* List */}
        <div className="max-h-[320px] overflow-y-auto scrollbar-hide">
          {count === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                <Inbox className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">
                All caught up
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                No new notifications
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visibleNotifications.map(
                ({ _id, text, _creationTime }) => (
                  <div
                    key={_id}
                    className="px-4 py-3 hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="h-3.5 w-3.5 text-sky-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {text}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-400">
                            {timeAgo(_creationTime)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => dismiss(_id)}
                        className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;
