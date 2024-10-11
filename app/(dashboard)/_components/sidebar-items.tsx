// app/(dashboard)/_components/sidebar-items.tsx
"use client";

import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

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
  href,
  isActive,
  onClick,
}: SidebarItemsProps) => {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/administrator");

  return (
    <button
      onClick={onClick}
      type="button"
      className={`relative flex rounded-md items-center gap-x-3 text-sm font-medium pl-6 py-3 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
        isActive
          ? isAdminPage
            ? "text-sky-700 font-bold bg-sky-100 hover:bg-sky-200"
            : "text-sky-700 font-bold bg-sky-200/30 hover:bg-sky-200/50"
          : isAdminPage
            ? "text-gray-700 hover:text-sky-700 hover:bg-sky-50"
            : "text-slate-500 hover:text-slate-600 hover:bg-slate-300/20"
      }`}
    >
      <Icon
        size={22}
        className={`transition-transform transform duration-500 ${
          isActive ? "spin-once scale-110" : "hover:scale-105"
        }`}
      />
      <span
        className={`transition-all duration-300 ${
          isActive ? "font-bold transform scale-105" : ""
        }`}
      >
        {label}
      </span>
    </button>
  );
};

export default SidebarItems;
