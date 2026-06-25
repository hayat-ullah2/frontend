"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Close, Logo, Menu, Search, User } from "../Icon";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/category/ai", label: "AI" },
  { href: "/category/programming", label: "Programming" },
  { href: "/category/business", label: "Business" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const authRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!authOpen) return;
    const onClick = (e: MouseEvent) => {
      if (authRef.current && !authRef.current.contains(e.target as Node)) {
        setAuthOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAuthOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [authOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? "backdrop-blur-xl bg-background/70 border-b border-white/5"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size={26} />
            <span className="font-bold text-lg tracking-tight">
              <span className="text-gradient-accent">Nex</span>Blog
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-sm text-foreground-muted hover:text-foreground rounded-lg hover:bg-white/5 transition"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-foreground-muted w-56">
              <Search size={16} />
              <input
                placeholder="Search articles…"
                className="bg-transparent outline-none border-0 text-foreground placeholder:text-foreground-subtle w-full"
              />
            </div>
            <div ref={authRef} className="relative hidden sm:block">
              <button
                onClick={() => setAuthOpen((v) => !v)}
                className="btn-ghost text-sm"
                aria-haspopup="menu"
                aria-expanded={authOpen}
              >
                <User size={14} />
                Sign up
              </button>
              {authOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-background-elev/95 backdrop-blur-xl shadow-2xl shadow-black/40 p-2 z-50 animate-fade-in-up"
                >
                  <Link
                    href="/login"
                    role="menuitem"
                    onClick={() => setAuthOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-white/5"
                  >
                    <span>Log in</span>
                    <span className="text-foreground-subtle">→</span>
                  </Link>
                  <Link
                    href="/signup"
                    role="menuitem"
                    onClick={() => setAuthOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-white bg-gradient-accent"
                  >
                    <span>Create account</span>
                    <span>→</span>
                  </Link>
                  <div className="my-1 border-t border-white/5" />
                  <Link
                    href="/admin"
                    role="menuitem"
                    onClick={() => setAuthOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs text-foreground-subtle hover:text-foreground hover:bg-white/5"
                  >
                    Admin panel
                  </Link>
                </div>
              )}
            </div>
            <Link href="/blog" className="btn-primary text-sm hidden sm:inline-flex">
              Read now
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/5 bg-white/5"
              aria-label="Toggle navigation"
            >
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-foreground-muted mb-2">
              <Search size={16} />
              <input
                placeholder="Search articles…"
                className="bg-transparent outline-none border-0 text-foreground placeholder:text-foreground-subtle w-full"
              />
            </div>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-foreground-muted hover:text-foreground rounded-lg hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="btn-ghost text-sm justify-center"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="btn-primary text-sm justify-center"
              >
                Create account
              </Link>
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="text-center text-xs text-foreground-subtle hover:text-foreground py-1"
              >
                Admin panel
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
