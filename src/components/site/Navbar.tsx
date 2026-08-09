"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { logout } from "@/lib/auth";
import { Close, Logo, Menu, Search, User } from "../Icon";

// Minimal, safe-to-serialize user shape. Never include role/email/bio here —
// these props get baked into the public HTML payload.
type NavUser = { _id: string; name: string; avatar?: string };

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/category/ai", label: "AI" },
  { href: "/category/programming", label: "Programming" },
  { href: "/category/business", label: "Business" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ user }: { user: NavUser | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/blog?q=${encodeURIComponent(q)}` : "/blog");
    setOpen(false);
  }

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logout();
    } catch (err) {
      if (!(err instanceof ApiError)) console.warn(err);
    } finally {
      setMenuOpen(false);
      setOpen(false);
      setSigningOut(false);
      router.refresh();
      router.push("/");
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

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
              <span className="text-gradient-accent">Nex</span>versal
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
            <form
              onSubmit={submitSearch}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-foreground-muted w-56"
            >
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles…"
                className="bg-transparent outline-none border-0 text-foreground placeholder:text-foreground-subtle w-full"
              />
            </form>

            <div ref={menuRef} className="relative hidden sm:block">
              {/*
                Admins are intentionally invisible on the public site — they get
                the same UI an anonymous visitor sees. They can sign out from
                inside the admin sidebar. The site layout passes `null` for
                admins so we don't even serialize their identity into the HTML.
              */}
              {user ? (
                <>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-label="Account menu"
                  >
                    <Avatar user={user} />
                    <span className="text-sm text-foreground hidden md:inline max-w-[140px] truncate">
                      {user.name}
                    </span>
                  </button>
                  {menuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-background-elev/95 backdrop-blur-xl shadow-2xl shadow-black/40 p-2 z-50 animate-fade-in-up"
                    >
                      <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-foreground-subtle truncate">Signed in</p>
                      </div>
                      <Link
                        href="/account"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-white/5"
                      >
                        <span>Your account</span>
                        <span className="text-foreground-subtle">→</span>
                      </Link>
                      <div className="my-1 border-t border-white/5" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        disabled={signingOut}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-500/10 disabled:opacity-60"
                      >
                        {signingOut ? "Signing out…" : "Log out"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="btn-ghost text-sm"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                  >
                    <User size={14} />
                    Sign up
                  </button>
                  {menuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-background-elev/95 backdrop-blur-xl shadow-2xl shadow-black/40 p-2 z-50 animate-fade-in-up"
                    >
                      <Link
                        href="/signup"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-white bg-gradient-accent"
                      >
                        <span>Create account</span>
                        <span>→</span>
                      </Link>
                      <Link
                        href="/login"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-white/5 mt-1"
                      >
                        <span>Log in</span>
                        <span className="text-foreground-subtle">→</span>
                      </Link>
                    </div>
                  )}
                </>
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
            <form
              onSubmit={submitSearch}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-foreground-muted mb-2"
            >
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles…"
                className="bg-transparent outline-none border-0 text-foreground placeholder:text-foreground-subtle w-full"
              />
            </form>
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
              {user ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-3">
                    <Avatar user={user} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-foreground-subtle truncate">Signed in</p>
                    </div>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="btn-ghost text-sm justify-center"
                  >
                    Your account
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={signingOut}
                    className="text-center text-sm py-2 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 disabled:opacity-60"
                  >
                    {signingOut ? "Signing out…" : "Log out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="btn-primary text-sm justify-center"
                  >
                    Create account
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="btn-ghost text-sm justify-center"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Avatar({ user }: { user: NavUser }) {
  if (user.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.name}
        width={28}
        height={28}
        className="rounded-full object-cover h-7 w-7"
      />
    );
  }
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span className="w-7 h-7 rounded-full bg-gradient-accent grid place-items-center text-white text-[10px] font-bold">
      {initials || "?"}
    </span>
  );
}
