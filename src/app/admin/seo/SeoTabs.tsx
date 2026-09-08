"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Overview", href: "/admin/seo" },
  { label: "Audit", href: "/admin/seo/audit" },
  { label: "Cannibalization", href: "/admin/seo/cannibalization" },
  { label: "Clusters", href: "/admin/seo/clusters" },
  { label: "Rankings", href: "/admin/seo/rankings" },
  { label: "Settings", href: "/admin/seo/settings" },
];

export default function SeoTabs() {
  const pathname = usePathname();

  return (
    <nav className="px-6 pt-4">
      <div className="flex gap-2 overflow-x-auto pb-px">
        {tabs.map((t) => {
          const active =
            t.href === "/admin/seo"
              ? pathname === "/admin/seo"
              : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                active
                  ? "bg-gradient-accent text-white"
                  : "text-foreground-muted hover:text-foreground hover:bg-white/5"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
