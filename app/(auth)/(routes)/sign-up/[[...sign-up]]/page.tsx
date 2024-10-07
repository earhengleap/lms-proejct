import Image from "next/image";
import { Loader2, ArrowLeft } from "lucide-react";
import { SignUp, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import Link from "next/link";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-sky-500">
        <Link
          href="/"
          className="absolute top-4 left-4 text-white flex items-center"
        >
          <ArrowLeft className="mr-2" /> Back
        </Link>
        <div className="text-center space-y-4 mb-8">
          <h1 className="font-bold text-2xl sm:text-3xl text-white">
            Create an Account
          </h1>
          <p className="text-sm sm:text-base text-white">
            Sign up to access your personalized dashboard!
          </p>
        </div>
        <div className="w-full max-w-sm">
          <ClerkLoaded>
            <SignUp routing="hash" />
          </ClerkLoaded>
          <ClerkLoading>
            <div className="flex justify-center">
              <Loader2 className="animate-spin text-white" />
            </div>
          </ClerkLoading>
        </div>
      </div>

      <div className="flex-1 bg-white hidden lg:flex items-center justify-center">
        <Image src="/main-logo.png" height={350} width={350} alt="Logo" />
      </div>
    </div>
  );
};

export default SignUpPage;
