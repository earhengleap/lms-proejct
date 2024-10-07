// app/(dashboard)/layout.tsx
"use client";

import { useEffect, useState } from "react";
import Navbar from "./_components/navbar";
import Sidebar from "./_components/sidebar";
import { RootRedirect } from "./_components/root-redirect";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <RootRedirect />
      <div className="flex-1">
        <div className="h-[80px] fixed inset-y-0 w-full z-[49]">
          <Navbar />
        </div>
        <div className="hidden lg:flex pt-[80px] h-full w-72 flex-col fixed inset-y-0 z-[48]">
          <Sidebar />
        </div>
        <main className="lg:pl-72 pt-[80px]">
          <div className="w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
