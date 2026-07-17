"use client";

import { Menu, ShieldCheck } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AdminSidebar from "./admin-sidebar";

const AdminMobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
        <Menu size={20} className="text-slate-600" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 w-72 border-0 shadow-xl [&>button]:hidden"
      >
        <AdminSidebar />
      </SheetContent>
    </Sheet>
  );
};

export default AdminMobileSidebar;
