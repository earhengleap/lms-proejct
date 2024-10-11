// app/(dashboard)/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { RootRedirect } from "./_components/root-redirect";
import Navbar from "./_components/navbar";
import Sidebar from "./_components/sidebar";
import { useAuth } from "@clerk/nextjs";
import { isAdministrator } from "@/lib/administrator";
import { usePathname } from "next/navigation";
import AdminNavbar from "./_components/admin-navbar";
import AdminSidebar from "./_components/admin-sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { userId } = useAuth();
  const pathname = usePathname();
  const isAdmin = isAdministrator(userId);
  const isAdminPage = pathname?.startsWith("/administrator");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="h-full">
      <RootRedirect />
      <div className="flex-1 flex flex-col">
        <div className="h-[80px] fixed inset-y-0 w-full z-[49]">
          {isAdmin && isAdminPage ? <AdminNavbar /> : <Navbar />}
        </div>
        <div className="hidden lg:flex pt-[80px] h-full w-72 flex-col fixed inset-y-0 z-[48]">
          {isAdmin && isAdminPage ? <AdminSidebar /> : <Sidebar />}
        </div>
        <main className={`flex-1 lg:pl-72 pt-[80px]`}>
          <div className="w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
