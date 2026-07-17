import NavbarRoutes from "@/components/navbar-routes";
import MobileSidebar from "./mobile-sidebar";

const Navbar = () => {
  return (
    <div className="h-full flex items-center px-4 sm:px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="flex items-center gap-x-4">
        <MobileSidebar />
      </div>
      <div className="flex-1">
        <NavbarRoutes />
      </div>
    </div>
  );
};

export default Navbar;
