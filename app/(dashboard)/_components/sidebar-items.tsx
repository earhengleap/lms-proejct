"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SidebarItemsProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  spinOnActive?: boolean;
}

const SidebarItems = ({
  icon: Icon,
  label,
  href,
  isActive,
  onClick,
  spinOnActive,
}: SidebarItemsProps) => {
  return (
    <Link href={href} onClick={onClick as any} prefetch className="block">
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 group cursor-pointer",
          isActive
            ? "text-sky-700"
            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/80"
        )}
      >
        {isActive && (
          <motion.span
            layoutId="sidebar-active-pill"
            className="absolute inset-0 rounded-xl bg-sky-50 ring-1 ring-sky-100"
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          />
        )}
        <Icon
          size={18}
          className={cn(
            "relative transition-all duration-300 shrink-0 z-10",
            isActive && spinOnActive && "spin-once scale-110",
            isActive && !spinOnActive && "scale-110",
            !isActive && "group-hover:scale-105"
          )}
        />
        <span className="relative truncate z-10">{label}</span>
      </motion.div>
    </Link>
  );
};

export default SidebarItems;
