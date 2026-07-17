"use client";

import { Card } from "@/components/ui/card";

export const CourseSkeleton = () => (
  <Card className="p-5 h-full bg-white border-slate-200/70 rounded-2xl">
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
      <div className="relative w-full sm:w-36 h-44 sm:h-32 rounded-xl bg-slate-200 animate-pulse shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-slate-200 rounded w-2/3 animate-pulse" />
          <div className="h-5 bg-slate-200 rounded-full w-16 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3.5 bg-slate-200 rounded animate-pulse" />
          <div className="h-3.5 bg-slate-200 rounded w-3/4 animate-pulse" />
        </div>
        <div className="flex gap-2 pt-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-7 bg-slate-200 rounded-full w-24 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between">
      <div className="h-3.5 bg-slate-200 rounded w-1/3 animate-pulse" />
      <div className="h-3.5 bg-slate-200 rounded w-20 animate-pulse" />
    </div>
  </Card>
);
