"use client";

import { roundIfNumber } from "@/lib/utils";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  value: number | string | null;
  label: string;
};

const MetricCard = (props: Props) => {
  const { value, label } = props;
  const isScore = label.toLowerCase().includes("score");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "rounded-2xl p-5 border transition-all duration-200",
        isScore
          ? "bg-emerald-50/80 border-emerald-200/60 hover:shadow-md hover:shadow-emerald-100"
          : "bg-sky-50/80 border-sky-200/60 hover:shadow-md hover:shadow-sky-100"
      )}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
        {roundIfNumber(value)}
      </p>
    </motion.div>
  );
};

export default MetricCard;
