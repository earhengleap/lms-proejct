import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ConfettiProvider } from "@/components/providers/confetti-provider";
import { ConvexClientProvider } from "@/context/convex-client-provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Customize weights as needed
});

export const metadata: Metadata = {
  title: "Pheasa",
  description:
    "Pheasa is an online learning platform that helps you learn new languages and skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={poppins.className}>
          <ConfettiProvider />
          <Toaster />
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
