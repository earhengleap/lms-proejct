// app/(dashboard)/_components/admin-mobile-sidebar.tsx
"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AdminSidebar from "./admin-sidebar";

const AdminMobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden p-2 hover:opacity-75 transition">
        <Menu size={24} />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <div className="p-6">
          <h2 className="text-lg font-bold">Admin Dashboard</h2>
        </div>
        <AdminSidebar />
      </SheetContent>
    </Sheet>
  );
};

export default AdminMobileSidebar;
