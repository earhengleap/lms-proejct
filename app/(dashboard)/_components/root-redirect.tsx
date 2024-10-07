"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export const RootRedirect = () => {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && !userId && pathname === "/") {
      router.push("/search");
    }
  }, [userId, isLoaded, pathname, router]);

  return null;
};
