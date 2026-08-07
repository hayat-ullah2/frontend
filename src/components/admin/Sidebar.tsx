"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { logout } from "@/lib/auth";
import type { ApiUser } from "@/lib/models";
import {
  BarChart,
  FileText,
  Home,
  Layers,
  Logo,
  MessageSquare,
  Settings,
  Users,
} from "../Icon";

const items = [
  { href: "/admin", label: "Dashboard", icon: BarChart },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/seo", label: "SEO", icon: Settings },
];

export default function Sidebar({ user }: { user: ApiUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logout();
    } catch (err) {
      if (!(err instanceof ApiError)) console.warn(err);
    } finally {
      router.refresh();
      router.push("/");
    }
  }

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-background-elev/40 backdrop-blur-md sticky top-0 h-screen">
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo size={24} />
          <span className="font-bold tracking-tight">
            <span className="text-gradient-accent">Nex</span>Admin
          </span>
        </Link>
      </div>
      <nav className="p-3 flex-1 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-wider text-foreground-subtle px-3 mb-2 mt-2">
          Workspace
        </p>
        {items.map((it) => {
          const active = pathname === it.href || (it.href !== "/admin" && pathname.startsWith(it.href));
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition relative ${
                active
                  ? "bg-white/5 text-foreground"
                  : "text-foreground-muted hover:text-foreground hover:bg-white/5"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r bg-gradient-accent" />
              )}
              <Icon size={16} />
              {it.label}
            </Link>
          );
        })}

        <p className="text-[10px] uppercase tracking-wider text-foreground-subtle px-3 mb-2 mt-6">
          Shortcuts
        </p>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-white/5"
        >
          <Home size={16} /> Back to site
        </Link>
      </nav>
      <div className="p-3 border-t border-white/5 space-y-2">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-2 py-2">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover h-8 w-8"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-accent grid place-items-center text-white text-xs font-bold">
                  {initials(user.name)}
                </div>
              )}
              <div className="text-xs min-w-0">
                <p className="font-medium text-foreground truncate">{user.name}</p>
                <p className="text-foreground-subtle truncate">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              className="w-full text-center text-xs py-2 rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 transition disabled:opacity-60"
            >
              {signingOut ? "Signing out…" : "Log out"}
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="block text-center text-xs py-2 rounded-lg border border-white/10 text-foreground-muted hover:text-foreground hover:bg-white/5"
          >
            Log in
          </Link>
        )}
      </div>
    </aside>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
