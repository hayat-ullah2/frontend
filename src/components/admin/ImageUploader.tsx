"use client";

import { useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { uploadImage } from "@/lib/uploads";

type Props = {
  value: string;
  onChange: (url: string, publicId?: string) => void;
  aspect?: string; // tailwind aspect-* class, default 16/9
  label?: string;
};

export default function ImageUploader({
  value,
  onChange,
  aspect = "aspect-[16/9]",
  label = "Cover image",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be 5 MB or smaller.");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadImage(file);
      onChange(result.url, result.publicId);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 401
            ? "Your session expired. Please log in again."
            : err.message
          : "Upload failed.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs uppercase tracking-wider text-foreground-subtle">
        {label}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`${aspect} relative rounded-xl border-2 border-dashed transition cursor-pointer overflow-hidden grid place-items-center bg-background ${
          dragging
            ? "border-violet-500/60 bg-violet-500/5"
            : "border-white/10 hover:border-white/20"
        } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
              <span className="text-[11px] text-white/80 bg-black/40 backdrop-blur px-2 py-1 rounded-md">
                {uploading ? "Uploading…" : "Click or drag to replace"}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("", undefined);
                }}
                className="text-[11px] text-white/80 bg-black/40 backdrop-blur px-2 py-1 rounded-md hover:bg-rose-500/60"
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <div className="text-center px-6">
            <p className="text-sm text-foreground-muted">
              {uploading ? "Uploading to Cloudinary…" : "Click or drag an image here"}
            </p>
            <p className="text-xs text-foreground-subtle mt-1">
              JPG, PNG, WebP, GIF, AVIF · max 5 MB
            </p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.currentTarget.value = "";
        }}
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value, undefined)}
        placeholder="…or paste an image URL"
        className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-foreground-subtle"
      />

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-xs px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
