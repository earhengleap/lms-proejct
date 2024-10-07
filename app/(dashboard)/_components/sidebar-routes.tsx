"use client";

import { Layout, Compass, List, BarChart, CheckSquare } from "lucide-react";
import SidebarItems from "./sidebar-items";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import LoginModal from "@/components/login-modal";

const studentRoutes = [
  {
    icon: Layout,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: Compass,
    label: "Browse",
    href: "/search",
  },
  {
    icon: CheckSquare,
    label: "Quizzes",
    href: "/quizzes",
  },
];

const teacherRoutes = [
  {
    icon: List,
    label: "Courses",
    href: "/teacher/courses",
  },
  {
    icon: BarChart,
    label: "Analytics",
    href: "/teacher/analytics",
  },
];

export const SidebarRoutes = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const isTeacherPage = pathname?.includes("/teacher");

  useEffect(() => {
    if (isLoaded && !userId && pathname === "/") {
      router.push("/search");
    }
  }, [userId, pathname, router, isLoaded]);

  const routes = isTeacherPage ? teacherRoutes : studentRoutes;

  const filteredRoutes = routes.filter((route) => {
    if (route.href === "/" && !userId) {
      return false;
    }
    return true;
  });

  const handleRouteClick = (href: string) => {
    if (!userId && (href === "/quizzes" || href === "/")) {
      setIsLoginModalOpen(true);
    } else {
      router.push(href);
    }
  };

  return (
    <>
      <div className="flex flex-col w-full space-y-2 px-4 py-2">
        {filteredRoutes.map((route) => (
          <SidebarItems
            key={route.href}
            icon={route.icon}
            label={route.label}
            href={route.href}
            isActive={
              pathname === route.href || pathname.startsWith(`${route.href}/`)
            }
            onClick={() => handleRouteClick(route.href)}
          />
        ))}
      </div>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};
