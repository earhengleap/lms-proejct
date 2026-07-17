"use client";

import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { isAdministrator } from "@/lib/administrator";
import { usePathname } from "next/navigation";
import { SidebarRoutes } from "./sidebar-routes";

const Sidebar = () => {
  const { userId } = useAuth();
  const pathname = usePathname();
  const isAdmin = isAdministrator(userId);
  const isAdminPage = pathname?.startsWith("/administrator");

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200/80">
      <div className="px-5 h-20 flex items-center border-b border-slate-100 lg:hidden">
        <span className="text-lg font-semibold text-slate-900 tracking-tight">
          Pheasa
        </span>
      </div>

      <div className="flex flex-col w-full flex-1 py-4 px-3 overflow-y-auto">
        {isAdmin && isAdminPage && (
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="block px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
          >
            Developer
          </motion.span>
        )}
        <SidebarRoutes />
      </div>
    </div>
  );
};

export default Sidebar;
