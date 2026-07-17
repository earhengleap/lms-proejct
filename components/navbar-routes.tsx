"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, LogIn, Search, X } from "lucide-react";
import Link from "next/link";
import {
  useAuth,
  UserButton,
  ClerkLoaded,
  ClerkLoading,
  useUser,
} from "@clerk/nextjs";
import Notifications from "./notifications";
import { Logo } from "@/app/(dashboard)/_components/logo";
import Modal from "./modal";
import { motion } from "framer-motion";

const handleBecomeInstructor = async () => {
  try {
    const response = await fetch("/api/be-instructor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to update instructor status");
    window.location.href = "/teacher/analytics";
  } catch (error) {
    console.error("Error becoming instructor:", error);
  }
};

const fetchInstructorStatus = async () => {
  try {
    const response = await fetch("/api/get-instructor-status", {
      method: "GET",
    });
    if (!response.ok) throw new Error("Failed to fetch instructor status");
    const data = await response.json();
    return data.isInstructor;
  } catch (error) {
    console.error("Error fetching instructor status:", error);
    return false;
  }
};

const checkAndCreateUser = async () => {
  try {
    const response = await fetch("/api/check-user", { method: "POST" });
    if (!response.ok) console.error("Failed to check or create user.");
  } catch (error) {
    console.error("Error:", error);
  }
};

const NavbarSearch = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(currentQuery);

  const isSearchPage = pathname === "/search";

  const updateQuery = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      params.delete("page");

      const url = `/search?${params.toString()}`;
      router.replace(url);
    },
    [router, searchParams]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    updateQuery(value);
  };

  const handleClear = () => {
    setQuery("");
    updateQuery("");
  };

  return (
    <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
      <div className="relative w-full group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-colors pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search courses..."
          className="w-full h-9 pl-9 pr-8 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all duration-200"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
};

const NavbarRoutes = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);

  const isTeacherPage = pathname?.startsWith("/teach");
  const isCoursePage = pathname?.includes("/courses");

  useEffect(() => {
    if (isSignedIn) {
      checkAndCreateUser();
      fetchInstructorStatus().then((status) => setIsInstructor(status));
    }
  }, [isSignedIn]);

  const handleConfirmBecomingInstructor = () => {
    handleBecomeInstructor();
    setIsInstructorModalOpen(false);
  };

  const handleInstructorButtonClick = () => {
    if (isInstructor) {
      router.push("/teacher/analytics");
    } else {
      setIsInstructorModalOpen(true);
    }
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: (i = 0) => ({
      opacity: 1,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  const text =
    "Becoming teachers without the need for verification. This encourages a free, community-driven learning environment where anyone can share their skills.";
  const words = text.split(" ");

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <div className="flex-shrink-0">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <NavbarSearch />

        <div className="flex items-center gap-2">
          {isTeacherPage || isCoursePage ? (
            <Link href="/">
              <Button size="sm" variant="ghost" className="text-slate-600">
                <LogOut className="h-4 w-4 mr-1.5" />
                Exit
              </Button>
            </Link>
          ) : isSignedIn ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-600"
                onClick={handleInstructorButtonClick}
              >
                <GraduationCap className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">
                  {isInstructor ? "Instructor Dashboard" : "Be Instructor"}
                </span>
              </Button>
            </>
          ) : null}

          {isSignedIn && user && <Notifications userId={user.id} />}

          <ClerkLoading>
            <div className="h-6 w-6 rounded-full animate-spin border-2 border-slate-200 border-t-sky-500" />
          </ClerkLoading>

          <ClerkLoaded>
            {isSignedIn ? (
              <UserButton />
            ) : (
              <Link href="/sign-in" passHref>
                <Button size="sm" variant="ghost" className="text-slate-600">
                  <LogIn className="h-4 w-4 mr-1.5" />
                  Sign in
                </Button>
              </Link>
            )}
          </ClerkLoaded>
        </div>
      </div>

      <Modal
        isOpen={isInstructorModalOpen}
        onClose={() => setIsInstructorModalOpen(false)}
        title="Become an Instructor"
        color="sky"
      >
        <div className="mb-6 text-sm leading-relaxed overflow-hidden">
          {words.map((word, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              style={{ display: "inline-block", marginRight: "4px" }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onClick={handleConfirmBecomingInstructor}
          className="w-full py-2 px-4 text-white font-medium rounded-md bg-sky-500 hover:bg-sky-600 transition-colors"
        >
          Continue
        </motion.button>
      </Modal>
    </>
  );
};

export default NavbarRoutes;
