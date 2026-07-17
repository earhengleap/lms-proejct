"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageCropper } from "@/components/image-cropper";
import { uploadFiles } from "@/lib/uploadthing-helpers";
import { toast } from "sonner";
import { ImagePlus, Loader2, RotateCcw } from "lucide-react";

interface CourseImageUploadProps {
  endpoint: "courseImage" | "bankQrCode";
  value?: string;
  onChange: (url: string) => void;
}

export const CourseImageUpload = ({
  endpoint,
  value,
  onChange,
}: CourseImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pendingSrc, setPendingSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const openFilePicker = () => inputRef.current?.click();

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setPendingSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const uploadBlob = async (blob: Blob) => {
    try {
      setUploading(true);
      const file = new File([blob], "course-image.png", { type: "image/png" });
      const res = await uploadFiles(endpoint, { files: [file] });
      const url = res?.[0]?.url;
      if (url) {
        onChange(url);
        setPendingSrc(null);
      } else {
        toast.error("Upload failed, please try again.");
      }
    } catch (error) {
      toast.error("Upload failed, please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      {pendingSrc ? (
        <ImageCropper
          src={pendingSrc}
          onCancel={() => setPendingSrc(null)}
          onCropped={(blob) => uploadBlob(blob)}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={uploading}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-600 transition hover:border-sky-400 hover:bg-sky-50/50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
            ) : (
              <ImagePlus className="h-4 w-4 text-sky-500" />
            )}
            {uploading ? "Uploading..." : "Choose an image to crop"}
          </button>

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPendingSrc(value)}
              disabled={uploading}
              className="self-start text-slate-500"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Re-crop current image
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
