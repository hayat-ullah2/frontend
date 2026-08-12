import Link from "next/link";
import { apiPublicSafe } from "@/lib/apiServer";
import type { ApiCategory } from "@/lib/models";
import CookieSettingsButton from "./CookieSettingsButton";
import { Github, Linkedin, Logo, Twitter } from "../Icon";

export default async function Footer() {
  // Real categories from the DB — only those with published posts, so the
  // footer never links to empty/placeholder categories.
  const categories = await apiPublicSafe<ApiCategory[]>("/categories", []);
  const categoryLinks = categories
    .filter((c) => (c.postCount ?? 0) > 0)
    .slice(0, 6)
    .map((c) => ({ href: `/category/${c.slug}`, label: c.name }));

  const cols = [
    {
      title: "Explore",
      links: [
        { href: "/", label: "Home" },
        { href: "/blog", label: "All Articles" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
      ],
    },
    ...(categoryLinks.length > 0
      ? [{ title: "Categories", links: categoryLinks }]
      : []),
    {
      title: "Resources",
      links: [
        { href: "/blog?sort=trending", label: "Trending" },
        { href: "/blog?sort=latest", label: "Latest" },
        { href: "/contact", label: "Become a writer" },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-white/5 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Logo size={28} />
              <span className="font-bold text-xl tracking-tight">
                <span className="text-gradient-accent">Nex</span>versal
              </span>
            </Link>
            <p className="mt-4 text-sm text-foreground-muted max-w-sm leading-relaxed">
              A premium multi-niche publication covering technology, AI, programming,
              business, finance, lifestyle, and the ideas at their intersection.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a className="btn-ghost p-2 rounded-full" href="#" aria-label="Twitter">
                <Twitter size={16} />
              </a>
              <a className="btn-ghost p-2 rounded-full" href="#" aria-label="GitHub">
                <Github size={16} />
              </a>
              <a className="btn-ghost p-2 rounded-full" href="#" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-foreground-muted hover:text-foreground transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-foreground-subtle">
            © {new Date().getFullYear()} Nexversal. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground-subtle">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
            <Link href="/disclosure" className="hover:text-foreground">Disclosure</Link>
            <CookieSettingsButton className="hover:text-foreground" />
          </div>
        </div>
      </div>
    </footer>
  );
}
