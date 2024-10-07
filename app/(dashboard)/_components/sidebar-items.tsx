"use client";

import { LucideIcon } from "lucide-react";

interface SidebarItemsProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarItems = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: SidebarItemsProps) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`relative flex rounded-md items-center gap-x-3 text-sm font-medium pl-6 py-3 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
        isActive
          ? "text-sky-700 font-bold bg-sky-200/30 hover:bg-sky-200/50"
          : "text-slate-500 hover:text-slate-600 hover:bg-slate-300/20"
      }`}
    >
      {/* Conditionally apply animation classes to the icon */}
      <Icon
        size={22}
        className={`transition-transform transform duration-500 ${
          isActive
            ? "text-sky-700 spin-once scale-110" // Scale and animate the icon when active
            : "text-slate-500 hover:scale-105" // Slight scale on hover
        }`}
      />
      <span
        className={`transition-all duration-300 ${
          isActive
            ? "text-sky-700 font-bold transform scale-105" // Scale text slightly when active
            : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </button>
  );
};

export default SidebarItems;
