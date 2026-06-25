import Link from "next/link";
import type { Metadata } from "next";
import { Github, Logo, Mail, Sparkles, Twitter } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your NexBlog account.",
};

export default function LoginPage() {
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
            Welcome back
          </h1>
          <p className="mt-2 text-foreground-muted text-sm">
            Sign in to continue reading where you left off.
          </p>

          {/* Dummy admin credentials notice */}
          <div className="mt-6 rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <Sparkles size={14} /> Demo credentials
            </p>
            <div className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs font-mono text-foreground-muted">
              <span className="text-foreground-subtle">email</span>
              <span>admin@nexblog.com</span>
              <span className="text-foreground-subtle">password</span>
              <span>admin123</span>
            </div>
          </div>

          <form className="mt-6 space-y-4">
            <Field
              label="Email"
              type="email"
              placeholder="admin@nexblog.com"
              defaultValue="admin@nexblog.com"
            />
            <Field
              label="Password"
              type="password"
              placeholder="••••••••"
              defaultValue="admin123"
              hint={
                <Link href="#" className="text-xs text-foreground-subtle hover:text-foreground">
                  Forgot password?
                </Link>
              }
            />

            <label className="flex items-center gap-2 text-xs text-foreground-muted">
              <input type="checkbox" defaultChecked className="rounded border-white/20" />
              Keep me signed in
            </label>

            <button type="button" className="btn-primary w-full">
              Log in
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-xs text-foreground-subtle">
            <span className="h-px flex-1 bg-white/5" />
            <span>or continue with</span>
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
            New to NexBlog?{" "}
            <Link href="/signup" className="text-gradient-accent font-medium">
              Create an account
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
              "radial-gradient(60% 60% at 30% 20%, rgba(139,92,246,0.25) 0%, transparent 60%), radial-gradient(50% 50% at 80% 70%, rgba(59,130,246,0.25) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-md p-10">
          <span className="chip">
            <Mail size={12} /> Member-only
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight leading-tight">
            One handpicked essay, three sharp links, every Sunday.
          </h2>
          <p className="mt-4 text-foreground-muted text-sm leading-relaxed">
            Members get the weekly digest, early access to long-form essays, and the
            private archive of every NexBlog issue.
          </p>
          <div className="mt-8 flex items-center gap-3 text-xs text-foreground-subtle">
            <span className="chip">No spam</span>
            <span className="chip">Unsubscribe anytime</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  defaultValue,
  hint,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  hint?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs uppercase tracking-wider text-foreground-subtle">
          {label}
        </label>
        {hint}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-foreground-subtle focus:border-violet-500/40 transition"
      />
    </div>
  );
}
