// app/(dashboard)/_components/admin-navbar.tsx
import { UserButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AdminMobileSidebar from "./admin-mobile-sidebar";

const AdminNavbar = () => {
  return (
    <div className="p-4 bg-white text-black h-full flex items-center border-b">
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center gap-x-4">
          <AdminMobileSidebar />
          <h2 className="text-lg font-bold hidden lg:block">
            Admin Dashboard
          </h2>
        </div>
        <div className="flex items-center gap-x-4">
          <Link href="/" className="hidden sm:block">
            <Button size="sm" variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Exit Admin
            </Button>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
