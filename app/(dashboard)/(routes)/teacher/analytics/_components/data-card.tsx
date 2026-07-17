"use client";

import React from "react";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DataCardProps {
  value: number;
  label: string;
  shouldFormat?: boolean;
  formatType?: "percent";
  description?: string;
  icon?: React.ReactNode;
  color?: "emerald" | "sky" | "amber" | "violet" | "indigo" | "rose" | "orange" | "teal";
}

const colorMap = {
  emerald: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-600",
  },
  sky: {
    bg: "bg-sky-50",
    icon: "bg-sky-100 text-sky-600",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "bg-amber-100 text-amber-600",
  },
  violet: {
    bg: "bg-violet-50",
    icon: "bg-violet-100 text-violet-600",
  },
  indigo: {
    bg: "bg-indigo-50",
    icon: "bg-indigo-100 text-indigo-600",
  },
  rose: {
    bg: "bg-rose-50",
    icon: "bg-rose-100 text-rose-600",
  },
  orange: {
    bg: "bg-orange-50",
    icon: "bg-orange-100 text-orange-600",
  },
  teal: {
    bg: "bg-teal-50",
    icon: "bg-teal-100 text-teal-600",
  },
};

const formatValue = (value: number, shouldFormat: boolean, formatType?: "percent") => {
  if (shouldFormat) return formatPrice(value);
  if (formatType === "percent") {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  }
  return value;
};

export const DataCard: React.FC<DataCardProps> = ({
  value,
  label,
  shouldFormat = false,
  formatType,
  description,
  icon,
  color = "sky",
}) => {
  const formattedValue = formatValue(value, shouldFormat, formatType);
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "rounded-2xl border p-5 transition-all duration-200 hover:shadow-md",
        colors.bg,
        "border-slate-200/40"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        {icon && (
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors.icon)}>
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight">
        {formattedValue}
      </div>
      {description && (
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      )}
    </motion.div>
  );
};
