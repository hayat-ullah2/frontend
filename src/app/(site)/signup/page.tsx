import Link from "next/link";
import type { Metadata } from "next";
import { Check, Github, Logo, Sparkles, Twitter } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Create account",
  description: "Join NexBlog — long-form essays for curious minds.",
};

const perks = [
  "Weekly digest with one handpicked essay",
  "Early access to long-form drops",
  "Private archive of every NexBlog issue",
  "Comment, bookmark, and follow authors",
];

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={26} />
            <span className="font-bold text-lg tracking-tight">
              <span className="text-gradient-accent">Nex</span>Blog
            </span>
          </Link>

          <h1 className="mt-10 text-3xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-foreground-muted text-sm">
            Free forever. Cancel any time. No credit card required.
          </p>

          <form className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" placeholder="Ada" />
              <Field label="Last name" placeholder="Lovelace" />
            </div>
            <Field label="Email" type="email" placeholder="you@example.com" />
            <Field label="Password" type="password" placeholder="At least 8 characters" />

            <label className="flex items-start gap-2 text-xs text-foreground-muted">
              <input type="checkbox" className="mt-0.5 rounded border-white/20" defaultChecked />
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

            <button type="button" className="btn-primary w-full">
              Create account
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-xs text-foreground-subtle">
            <span className="h-px flex-1 bg-white/5" />
            <span>or sign up with</span>
            <span className="h-px flex-1 bg-white/5" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button className="btn-ghost text-sm">
              <Github size={16} /> GitHub
            </button>
            <button className="btn-ghost text-sm">
              <Twitter size={16} /> Twitter
            </button>
          </div>

          <p className="mt-8 text-sm text-foreground-muted text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-gradient-accent font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right: visual */}
      <aside className="hidden lg:flex relative items-center justify-center overflow-hidden border-l border-white/5">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 70% 20%, rgba(59,130,246,0.25) 0%, transparent 60%), radial-gradient(50% 50% at 20% 80%, rgba(139,92,246,0.25) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-md p-10">
          <span className="chip">
            <Sparkles size={12} /> Join 42,000+ readers
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight leading-tight">
            Long-form for the <span className="text-gradient-accent">curious.</span>
          </h2>
          <p className="mt-4 text-foreground-muted text-sm leading-relaxed">
            NexBlog is a small, opinionated publication — depth over volume, trust over reach.
          </p>
          <ul className="mt-8 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-gradient-accent grid place-items-center text-white">
                  <Check size={12} />
                </span>
                <span className="text-foreground-muted">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-foreground-subtle focus:border-violet-500/40 transition"
      />
    </div>
  );
}
