"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { updateMe } from "@/lib/auth";
import type { ApiUser } from "@/lib/models";
import { uploadImage } from "@/lib/uploads";

export default function AccountForm({ user }: { user: ApiUser }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio ?? "");
  const [avatar, setAvatar] = useState(user.avatar ?? "");
  const [avatarPublicId, setAvatarPublicId] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handlePickAvatar(file: File) {
    setError(null);
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setError("Avatar must be an image under 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadImage(file);
      setAvatar(result.url);
      setAvatarPublicId(result.publicId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await updateMe({
        name: name.trim(),
        bio: bio.trim(),
        avatar: avatar.trim() || undefined,
        avatarPublicId,
      });
      setSuccess("Profile updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="relative w-24 h-24 rounded-2xl border border-white/10 overflow-hidden bg-background grid place-items-center hover:border-violet-500/40 transition disabled:opacity-60"
        >
          {avatar ? (
            <Image src={avatar} alt={name} fill sizes="96px" className="object-cover" />
          ) : (
            <span className="text-3xl text-foreground-subtle">＋</span>
          )}
        </button>
        <div>
          <p className="text-sm font-semibold">{uploading ? "Uploading…" : "Profile photo"}</p>
          <p className="text-xs text-foreground-subtle mt-1">Click to upload · JPG/PNG/WebP · max 5 MB</p>
          {avatar && (
            <button
              type="button"
              onClick={() => {
                setAvatar("");
                setAvatarPublicId(undefined);
              }}
              className="text-xs text-rose-300 hover:text-rose-200 mt-2"
            >
              Remove
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.currentTarget.value = "";
              if (f) handlePickAvatar(f);
            }}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
          Display name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
          Email
        </label>
        <input
          value={user.email}
          disabled
          className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-foreground-subtle cursor-not-allowed"
        />
        <p className="text-xs text-foreground-subtle mt-1.5">
          Email changes aren't supported in this demo.
        </p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
          Bio
        </label>
        <textarea
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A short bio shown on your author page."
          className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none resize-none"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-xs px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs px-3 py-2">
          {success}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
        <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
