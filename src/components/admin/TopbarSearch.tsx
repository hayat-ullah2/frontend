"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "@/components/Icon";

export default function TopbarSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    next.delete("page");
    const qs = next.toString();
    // On the dashboard, redirect to /admin/blogs for search.
    const target = pathname === "/admin" ? "/admin/blogs" : pathname;
    router.push(`${target}${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-foreground-muted w-72"
    >
      <Search size={16} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search admin…"
        className="bg-transparent outline-none border-0 text-foreground placeholder:text-foreground-subtle w-full"
      />
    </form>
  );
}
