"use client";

import { SidebarRoutes } from "./sidebar-routes";

const AdminSidebar = () => {
  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200/80">
      <div className="flex items-center px-5 h-20 border-b border-slate-100 lg:hidden">
        <span className="text-lg font-semibold text-slate-900 tracking-tight">
          Admin Dashboard
        </span>
      </div>

      <div className="flex flex-col w-full flex-1 py-4 px-3 overflow-y-auto">
        <span className="block px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Management
        </span>
        <SidebarRoutes />
      </div>

      <div className="px-5 py-4 border-t border-slate-100">
        <p className="text-[11px] text-slate-400">Pheasa Admin</p>
      </div>
    </div>
  );
};

export default AdminSidebar;
