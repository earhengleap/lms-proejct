"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, LogIn } from "lucide-react";
import Link from "next/link";
import {
  useAuth,
  UserButton,
  ClerkLoaded,
  ClerkLoading,
  useUser,
} from "@clerk/nextjs";
import SearchInput from "./search-input";
import Notifications from "./notifications";
import { Logo } from "@/app/(dashboard)/_components/logo";
import Modal from "./modal";
import { motion } from "framer-motion";

const handleBecomeInstructor = async () => {
  try {
    const response = await fetch("/api/be-instructor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to update instructor status");
    }

    window.location.href = "/teacher/courses";
  } catch (error) {
    console.error("Error becoming instructor:", error);
  }
};

const fetchInstructorStatus = async () => {
  try {
    const response = await fetch("/api/get-instructor-status", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch instructor status");
    }

    const data = await response.json();
    return data.isInstructor;
  } catch (error) {
    console.error("Error fetching instructor status:", error);
    return false;
  }
};

const checkAndCreateUser = async () => {
  try {
    const response = await fetch("/api/check-user", {
      method: "POST",
    });

    if (!response.ok) {
      console.error("Failed to check or create user.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
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
  const isSearchPage = pathname?.startsWith("/search");

  useEffect(() => {
    if (isSignedIn) {
      checkAndCreateUser();
      fetchInstructorStatus().then((status) => {
        setIsInstructor(status);
      });
    }
  }, [isSignedIn]);

  const handleInstructorButtonClick = () => {
    if (isInstructor) {
      router.push("/teacher/courses");
    } else {
      setIsInstructorModalOpen(true);
    }
  };

  const handleConfirmBecomingInstructor = () => {
    handleBecomeInstructor();
    setIsInstructorModalOpen(false);
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
      <div className="flex w-full items-center justify-between gap-x-4">
        <div className="flex-shrink-0">
          <Link href={"/"}>
            <Logo />
          </Link>
        </div>

        <div className="hidden lg:flex flex-1 justify-center">
          {isSearchPage && (
            <div className="w-full max-w-lg">
              <SearchInput />
            </div>
          )}
        </div>

        <div className="flex items-center gap-x-4">
          {isTeacherPage || isCoursePage ? (
            <Link href={"/"}>
              <Button size="sm" variant="ghost">
                <LogOut className="h-4 w-4 mr-2" />
                Exit
              </Button>
            </Link>
          ) : isSignedIn ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleInstructorButtonClick}
            >
              <GraduationCap className="mr-2 w-7 h-7" />
              {isInstructor ? "Instructor Dashboard" : "Be Instructor"}
            </Button>
          ) : null}

          {isSignedIn && user && <Notifications userId={user.id} />}

          <ClerkLoading>
            <div className="h-6 w-6 rounded-full animate-spin border-4 border-gray-300 border-t-transparent"></div>
          </ClerkLoading>

          <ClerkLoaded>
            {isSignedIn ? (
              <UserButton />
            ) : (
              <Link href="/sign-in" passHref>
                <Button type="button" variant="outline">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
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
          whileHover={{
            scale: 1.05,
            background: "linear-gradient(90deg, #4FACFE, #00F2FE)",
            transition: { duration: 0.3 },
          }}
          whileTap={{
            scale: 0.95,
            background: "linear-gradient(90deg, #4FACFE, #00F2FE)",
            transition: { duration: 0.2 },
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onClick={handleConfirmBecomingInstructor}
          className="w-full py-2 px-4 text-white font-semibold rounded-md shadow-lg"
          style={{
            background: "linear-gradient(90deg, #4FACFE, #00F2FE)",
          }}
        >
          Continue
        </motion.button>
      </Modal>
    </>
  );
};

export default NavbarRoutes;
