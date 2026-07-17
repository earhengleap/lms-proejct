"use client";

import {
  Layout,
  Compass,
  List,
  BarChart,
  CheckSquare,
  Users,
  LayoutDashboard,
  GraduationCap,
  CreditCard,
  MessageSquare,
  BarChart2,
  Settings,
} from "lucide-react";
import SidebarItems from "./sidebar-items";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import LoginModal from "@/components/login-modal";
import { isAdministrator } from "@/lib/administrator";
import { motion } from "framer-motion";

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
    spinOnActive: true,
  },
  {
    icon: CheckSquare,
    label: "Quizzes",
    href: "/quizzes",
  },
];

const teacherRoutes = [
  {
    icon: BarChart,
    label: "Dashboard",
    href: "/teacher/analytics",
  },
  {
    icon: List,
    label: "Courses",
    href: "/teacher/courses",
  },
  {
    icon: CreditCard,
    label: "Wallet",
    href: "/teacher/wallet",
  },
];

const adminRoutes = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/administrator",
  },
  {
    icon: GraduationCap,
    label: "Courses",
    href: "/administrator/courses",
  },
  {
    icon: Users,
    label: "Teachers",
    href: "/administrator/teachers",
  },
  {
    icon: MessageSquare,
    label: "Messages",
    href: "/administrator/messages",
  },
  {
    icon: BarChart2,
    label: "Analytics",
    href: "/administrator/analytics",
  },
  {
    icon: CreditCard,
    label: "Payments",
    href: "/administrator/payments",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/administrator/settings",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

const isRouteActive = (pathname: string | null, href: string): boolean => {
  if (!pathname) return false;
  if (pathname === href) return true;
  // Index/base routes (e.g. "/", "/administrator", "/teacher/analytics")
  // must NOT match their subpaths.
  if (href === "/") return pathname === "/";
  if (href === "/administrator") return pathname === "/administrator";
  if (href === "/teacher/analytics")
    return pathname === "/teacher/analytics";
  return pathname === href || pathname.startsWith(`${href}/`);
};

export const SidebarRoutes = () => {
  const pathname = usePathname();
  const { userId } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const isTeacherPage = pathname?.startsWith("/teacher");
  const isAdminPage = pathname?.startsWith("/administrator");

  let routes;
  if (isAdministrator(userId)) {
    if (isAdminPage) {
      routes = adminRoutes;
    } else if (isTeacherPage) {
      routes = teacherRoutes;
    } else {
      routes = studentRoutes;
    }
  } else {
    routes = isTeacherPage ? teacherRoutes : studentRoutes;
  }

  const filteredRoutes = routes;

  const handleRouteClick = (href: string) => {
    if (!userId && href === "/quizzes") {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-1"
      >
        {filteredRoutes.map((route) => (
          <motion.div key={route.href} variants={item}>
            <SidebarItems
              icon={route.icon}
              label={route.label}
              href={route.href}
              isActive={isRouteActive(pathname, route.href)}
              onClick={
                !userId && route.href === "/quizzes"
                  ? (e?: React.MouseEvent) => {
                      e?.preventDefault();
                      setIsLoginModalOpen(true);
                    }
                  : undefined
              }
              spinOnActive={(route as any).spinOnActive}
            />
          </motion.div>
        ))}
      </motion.div>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};
