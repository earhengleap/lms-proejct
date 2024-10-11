//app/(dashboard)/_components/sidebar.tsx

import { SidebarRoutes } from "./sidebar-routes";
import { useAuth } from "@clerk/nextjs";
import { isAdministrator } from "@/lib/administrator";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const { userId } = useAuth();
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/administrator");
  const isAdmin = isAdministrator(userId);

  const sidebarClass =
    isAdmin && isAdminPage
      ? "h-full flex flex-col text-black border-r overflow-y-auto"
      : "h-full flex flex-col bg-white border-r overflow-y-auto";

  return (
    <div className={sidebarClass}>
      <div className="flex flex-col w-full flex-1">
        {isAdmin && isAdminPage && (
          <h2 className="text-2xl font-bold mb-6 text-center p-4">Developer</h2>
        )}
        <SidebarRoutes />
      </div>
    </div>
  );
};

export default Sidebar;
