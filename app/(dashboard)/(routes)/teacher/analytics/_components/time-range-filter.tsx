"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

export const TimeRangeFilter = () => {
  const [timeRange, setTimeRange] = useState("30days");

  return (
    <Select value={timeRange} onValueChange={setTimeRange}>
      <SelectTrigger className="w-[160px] h-9 rounded-xl border-slate-200/60 text-sm">
        <Calendar className="h-3.5 w-3.5 text-slate-400 mr-1.5" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="7days" className="text-sm">Last 7 days</SelectItem>
        <SelectItem value="30days" className="text-sm">Last 30 days</SelectItem>
        <SelectItem value="3months" className="text-sm">Last 3 months</SelectItem>
        <SelectItem value="custom" className="text-sm">Custom range</SelectItem>
      </SelectContent>
    </Select>
  );
};
