"use client";

import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Loader2, Crop as CropIcon } from "lucide-react";

interface ImageCropperProps {
  src: string;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
}

function getCroppedBlob(src: string, area: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = area.width;
      canvas.height = area.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(
        image,
        area.x,
        area.y,
        area.width,
        area.height,
        0,
        0,
        area.width,
        area.height
      );

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas is empty"));
      }, "image/png");
    };
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = src;
  });
}

export const ImageCropper = ({ src, onCancel, onCropped }: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCropComplete = (_: Area, areaPixels: Area) => {
    setArea(areaPixels);
  };

  const handleConfirm = async () => {
    if (!area) return;
    try {
      setLoading(true);
      const blob = await getCroppedBlob(src, area);
      onCropped(blob);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full h-[320px] rounded-xl overflow-hidden bg-slate-900/90">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={undefined}
          showGrid
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          objectFit="contain"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 whitespace-nowrap">Zoom</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-sky-500"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={loading || !area}
          className="bg-sky-500 hover:bg-sky-600 text-white"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CropIcon className="h-4 w-4 mr-2" />
          )}
          Crop &amp; use
        </Button>
      </div>
    </div>
  );
};
