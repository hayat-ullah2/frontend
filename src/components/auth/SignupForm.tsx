"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { signup, updateMe } from "@/lib/auth";
import { uploadImage } from "@/lib/uploads";

export default function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms and Privacy Policy.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const { user } = await signup({ name: fullName.trim(), email, password });

      // Avatar (optional). Done after signup so the new auth cookie authorizes the upload.
      if (avatarFile) {
        try {
          const uploaded = await uploadImage(avatarFile);
          await updateMe({ avatar: uploaded.url, avatarPublicId: uploaded.publicId });
        } catch (avatarErr) {
          console.warn("Avatar upload failed:", avatarErr);
        }
      }

      setSuccess(`Account created. Welcome, ${user.name}.`);
      router.push("/");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Unable to create account. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4" autoComplete="off">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          className="relative w-16 h-16 rounded-full border border-white/10 bg-background-elev overflow-hidden grid place-items-center text-foreground-subtle hover:border-violet-500/40 transition"
          aria-label="Choose avatar"
        >
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">＋</span>
          )}
        </button>
        <div className="text-xs">
          <p className="text-foreground font-medium">Profile photo</p>
          <p className="text-foreground-subtle">Optional · JPG/PNG/WebP · max 5 MB</p>
          {avatarFile && (
            <button
              type="button"
              onClick={() => {
                setAvatarFile(null);
                setAvatarPreview("");
              }}
              className="text-rose-300 hover:text-rose-200 mt-1"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.currentTarget.value = "";
            if (!f) return;
            if (!f.type.startsWith("image/") || f.size > 5 * 1024 * 1024) {
              setError("Avatar must be an image under 5 MB.");
              return;
            }
            setAvatarFile(f);
            setAvatarPreview(URL.createObjectURL(f));
          }}
        />
      </div>
      <Field
        label="Full name"
        placeholder="Ada Lovelace"
        value={fullName}
        onChange={setFullName}
        name="signup-name"
        autoComplete="off"
      />
      <Field
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={setEmail}
        name="signup-email"
        autoComplete="off"
      />
      <Field
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        value={password}
        onChange={setPassword}
        name="signup-password"
        autoComplete="new-password"
      />

      <label className="flex items-start gap-2 text-xs text-foreground-muted">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 rounded border-white/20"
        />
        <span>
          I agree to the{" "}
          <Link href="#" className="text-foreground underline underline-offset-2">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-foreground underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  autoComplete,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  name?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-foreground-subtle focus:border-violet-500/40 transition"
      />
    </div>
  );
}

function Alert({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  const map = {
    error: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  } as const;
  return (
    <div className={`rounded-lg border px-3 py-2 text-xs ${map[tone]}`} role="alert">
      {children}
    </div>
  );
}
