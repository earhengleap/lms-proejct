"use client";

import { ArrowUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SORT_OPTIONS, type SortValue } from "./types";

interface SortControlProps {
  currentSort: SortValue;
  onSortChange: (value: SortValue) => void;
}

export const SortControl = ({
  currentSort,
  onSortChange,
}: SortControlProps) => {
  const activeLabel =
    SORT_OPTIONS.find((option) => option.value === currentSort)?.label ??
    "Sort by";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-11 rounded-xl bg-white border-slate-200/80 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors gap-2 shrink-0"
        >
          <ArrowUpDown className="w-4 h-4 text-slate-500" />
          <span className="text-slate-700">{activeLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5">
        {SORT_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className="flex items-center justify-between rounded-lg text-sm cursor-pointer"
          >
            <span>{option.label}</span>
            {currentSort === option.value && (
              <Check className="w-4 h-4 text-sky-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
