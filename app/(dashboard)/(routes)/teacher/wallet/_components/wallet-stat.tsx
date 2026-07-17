"use client";

import React from "react";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WalletStatProps {
  value: number;
  label: string;
  shouldFormat?: boolean;
  description?: string;
  icon?: React.ReactNode;
  emphasis?: boolean;
}

const formatValue = (value: number, shouldFormat: boolean) => {
  if (shouldFormat) return formatPrice(value);
  return value;
};

export const WalletStat: React.FC<WalletStatProps> = ({
  value,
  label,
  shouldFormat = false,
  description,
  icon,
  emphasis = false,
}) => {
  const formattedValue = formatValue(value, shouldFormat);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
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
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center",
              emphasis
                ? "bg-white/10 text-white"
                : "bg-slate-100 text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors"
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <div
        className={cn(
          "text-2xl font-semibold tracking-tight tabular-nums",
          emphasis ? "text-white" : "text-slate-900"
        )}
      >
        {formattedValue}
      </div>
      {description && (
        <p
          className={cn(
            "text-xs mt-1.5",
            emphasis ? "text-slate-400" : "text-slate-400"
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
};
