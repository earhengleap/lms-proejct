import { SidebarRoutes } from "./sidebar-routes";

const Sidebar = () => {
  return (
    <div className="h-full flex flex-col bg-white border-r overflow-y-auto">
      <div className="flex flex-col w-full flex-1">
        <SidebarRoutes />
      </div>
    </div>
  );
};
export default Sidebar;
