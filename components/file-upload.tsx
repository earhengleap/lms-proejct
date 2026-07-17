"use client";

import { UploadDropzone } from "@/lib/uploadthing-client";
import type { OurFileRouter } from "@/lib/uploadthing";
import { toast } from "sonner";

interface FileUploadProps {
  onChange: (url?: string) => void;
  endpoint: keyof OurFileRouter;
}

export const FileUpload = ({ onChange, endpoint }: FileUploadProps) => {
  return <UploadDropzone
    endpoint={endpoint}
    onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
    }}
    onUploadError={(error: Error) => {
        toast.error(`${error?.message}`);
    }}
  />;
};