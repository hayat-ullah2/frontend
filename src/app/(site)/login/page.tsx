import Link from "next/link";
import type { Metadata } from "next";
import AuthTabs from "@/components/auth/AuthTabs";
import LoginForm from "@/components/auth/LoginForm";
import { Github, Logo, Mail, Twitter } from "@/components/Icon";

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

          <AuthTabs active="login" />

          <LoginForm />

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

