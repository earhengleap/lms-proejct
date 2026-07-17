"use client";

import { motion } from "framer-motion";
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  message: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="col-span-full flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50"
  >
    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
      <PackageOpen className="w-6 h-6 text-slate-400" />
    </div>
    <p className="text-sm text-slate-500">{message}</p>
  </motion.div>
);
