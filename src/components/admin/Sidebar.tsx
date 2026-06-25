"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

export default function Sidebar() {
  const pathname = usePathname();
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
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-accent grid place-items-center text-white text-xs font-bold">
            NX
          </div>
          <div className="text-xs">
            <p className="font-medium text-foreground">Nexus Admin</p>
            <p className="text-foreground-subtle">admin@nexblog.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
