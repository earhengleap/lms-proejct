"use client";

import { UserButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AdminMobileSidebar from "./admin-mobile-sidebar";
import { Logo } from "./logo";

const AdminNavbar = () => {
  return (
    <div className="h-full flex items-center px-4 sm:px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="flex items-center w-full justify-between gap-4">
        <div className="flex items-center gap-x-3">
          <AdminMobileSidebar />
          <Logo />
        </div>

        <div className="flex items-center gap-x-3">
          <Link href="/">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Exit Admin</span>
            </Button>
          </Link>
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
