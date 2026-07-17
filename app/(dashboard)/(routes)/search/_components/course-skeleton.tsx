"use client";

import { Card } from "@/components/ui/card";

export const CourseSkeleton = () => {
  return (
    <Card className="h-full flex flex-col animate-pulse">
      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted" />
      <div className="flex-1 flex flex-col p-3 space-y-2">
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-3 w-1/2 bg-muted rounded" />
        <div className="h-3 w-1/3 bg-muted rounded mt-auto" />
        <div className="flex items-center gap-2 mt-2">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      </div>
    </Card>
  );
};

export const CourseGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CourseSkeleton key={i} />
      ))}
    </div>
  );
};
