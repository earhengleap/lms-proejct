import NavbarRoutes from "@/components/navbar-routes";
import MobileSidebar from "./mobile-sidebar";

const Navbar = () => {
  return (
    <div className="p-4 sm:p-6 h-full flex items-center bg-white border-b justify-between">
      {/* Left Side - Mobile Sidebar and Logo for small screens */}
      <div className="flex items-center gap-x-4">
        <MobileSidebar />
      </div>

      {/* NavbarRoutes will handle the logo, search, and user navigation */}
      <div className="flex-1">
        <NavbarRoutes />
      </div>
    </div>
  );
};
export default Navbar;
