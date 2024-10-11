// app/(dashboard)/_components/admin-sidebar.tsx
import { SidebarRoutes } from "./sidebar-routes";

const AdminSidebar = () => {
  return (
    <div className="h-full flex flex-col bg-white text-black border-r overflow-y-auto">
      <div className="flex flex-col w-full flex-1">
        <SidebarRoutes />
      </div>
    </div>
  );
};

export default AdminSidebar;
