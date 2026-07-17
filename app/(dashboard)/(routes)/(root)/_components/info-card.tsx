"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  numberOfItems: number;
  variant?: "default" | "success";
  label: string;
  icon: LucideIcon;
}

export const InfoCard = ({
  variant,
  icon: Icon,
  numberOfItems,
  label,
}: InfoCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "rounded-2xl p-5 flex items-center gap-4 border transition-all duration-200",
        variant === "success"
          ? "bg-emerald-50/80 border-emerald-200/60 hover:shadow-md hover:shadow-emerald-100"
          : "bg-sky-50/80 border-sky-200/60 hover:shadow-md hover:shadow-sky-100"
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          variant === "success"
            ? "bg-emerald-100 text-emerald-600"
            : "bg-sky-100 text-sky-600"
        )}
      >
        <Icon size={22} strokeWidth={2} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">
          {numberOfItems}
          <span className="text-sm font-normal text-slate-400 ml-1">
            {numberOfItems === 1 ? "course" : "courses"}
          </span>
        </p>
      </div>
    </motion.div>
  );
};
