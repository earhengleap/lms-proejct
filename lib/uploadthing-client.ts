import { generateUploadButton, generateUploadDropzone, generateUploader } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const Uploader = generateUploader<OurFileRouter>();