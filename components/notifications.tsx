"use client";

import { api } from "@/convex/_generated/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMutation, useQuery } from "convex/react";
import { Bell, CheckIcon, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { timeAgo } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Notifications = ({ userId }: { userId: string }) => {
  const notifications = useQuery(api.notifications.getNotifications, {
    userId,
  });
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsRead = useMutation(
    api.notifications.markAllNotificationsAsRead
  );

  const hasNewNotifications = !!notifications?.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="p-2 relative">
          <Bell width={16} />
          {hasNewNotifications && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
              {notifications.length}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="end"
        alignOffset={-40}
        side="bottom"
        sideOffset={5}
      >
        <div className="flex p-4">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <Separator />
        <ScrollArea className="h-[300px] overflow-y-auto">
          <div className="space-y-4 p-4">
            {!hasNewNotifications && <p>You have no unread notifications</p>}
            {hasNewNotifications &&
              notifications?.map(({ _id, text, _creationTime }) => (
                <div
                  key={_id}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm">{text}</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="mr-1 h-3 w-3" />
                            <span>{timeAgo(_creationTime)}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{new Date(_creationTime).toLocaleString()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Button
                    onClick={() => markAsRead({ id: _id })}
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </ScrollArea>
        {hasNewNotifications && (
          <>
            <Separator />
            <div className="p-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => markAllAsRead({ userId })}
              >
                Mark all as read
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;
