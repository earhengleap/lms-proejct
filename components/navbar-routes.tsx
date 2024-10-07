"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, LogIn } from "lucide-react";
import Link from "next/link";
import {
  useAuth,
  UserButton,
  ClerkLoaded,
  ClerkLoading,
  useUser,
} from "@clerk/nextjs"; // Added useUser
import SearchInput from "./search-input";
import Notifications from "./notifications";
import { Logo } from "@/app/(dashboard)/_components/logo";
import LoginModal from "./login-modal";

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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const isTeacherPage = pathname?.startsWith("/teach");
  const isCoursePage = pathname?.includes("/courses");
  const isSearchPage = pathname?.startsWith("/search");

  useEffect(() => {
    if (isSignedIn) {
      checkAndCreateUser();
    }
  }, [isSignedIn]);

  return (
    <>
      <div className="flex w-full items-center justify-between gap-x-4">
        {/* Left Side - Logo */}
        <div className="flex-shrink-0">
          <Link href={"/"}>
            <Logo />
          </Link>
        </div>

        {/* Middle - SearchInput (only show on larger screens) */}
        <div className="hidden lg:flex flex-1 justify-center">
          {isSearchPage && (
            <div className="w-full max-w-lg">
              <SearchInput />
            </div>
          )}
        </div>

        {/* Right Side - User and Navigation */}
        <div className="flex items-center gap-x-4">
          {isTeacherPage || isCoursePage ? (
            <Link href={"/"}>
              <Button size="sm" variant="ghost">
                <LogOut className="h-4 w-4 mr-2" />
                Exit
              </Button>
            </Link>
          ) : isSignedIn ? (
            <Link href={"/teacher/courses"} passHref>
              <Button size="sm" variant="ghost">
                <GraduationCap className="mr-2 w-7 h-7" />
                Be Instructor
              </Button>
            </Link>
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
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default NavbarRoutes;
