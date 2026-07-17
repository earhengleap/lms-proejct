"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SearchBar = ({ value, onChange, className }: SearchBarProps) => {
  return (
    <div className={cn("relative flex-1 min-w-0", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
      <Input
        placeholder="Search courses, publishers..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-9 h-11 rounded-xl bg-white border-slate-200/80 shadow-sm focus-visible:ring-sky-500/30 focus-visible:border-sky-400 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
