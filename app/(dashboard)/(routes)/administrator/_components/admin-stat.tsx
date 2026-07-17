import React from "react";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AdminStatProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
  shouldFormat?: boolean;
  emphasis?: boolean;
}

export const AdminStat: React.FC<AdminStatProps> = ({
  icon: Icon,
  title,
  value,
  shouldFormat = false,
  emphasis = false,
}) => {
  return (
    <div
      className={cn(
        "group rounded-2xl border p-5 transition-all duration-200",
        emphasis
          ? "bg-slate-900 border-slate-900"
          : "bg-white border-slate-200/70 hover:border-slate-300 hover:shadow-sm"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span
          className={cn(
            "text-[13px] font-medium tracking-tight",
            emphasis ? "text-slate-300" : "text-slate-500"
          )}
        >
          {title}
        </span>
        <div
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center",
            emphasis
              ? "bg-white/10 text-white"
              : "bg-slate-100 text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div
        className={cn(
          "text-2xl font-semibold tracking-tight tabular-nums",
          emphasis ? "text-white" : "text-slate-900"
        )}
      >
        {shouldFormat ? formatPrice(value) : value.toLocaleString()}
      </div>
    </div>
  );
};
