"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "./Icon";

type SelectField = {
  type: "select";
  name: string;
  label: string;
  options: { value: string; label: string }[];
};
type SearchField = {
  type: "search";
  name: string;
  placeholder?: string;
};
type Field = SearchField | SelectField;

export default function FilterBar({
  fields,
  className,
}: {
  fields: Field[];
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Local state for the search box so typing is responsive.
  const initialSearch = fields.find((f) => f.type === "search")?.name ?? "";
  const [q, setQ] = useState(params.get(initialSearch) ?? "");

  // Keep local state in sync if URL changes externally.
  useEffect(() => {
    setQ(params.get(initialSearch) ?? "");
  }, [params, initialSearch]);

  function update(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    next.delete("page"); // reset to first page when filters change
    const qs = next.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  function handleSearch(name: string, e: React.FormEvent) {
    e.preventDefault();
    update(name, q.trim());
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}>
      {fields.map((f) => {
        if (f.type === "search") {
          return (
            <form
              key={f.name}
              onSubmit={(e) => handleSearch(f.name, e)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-white/5 w-full md:w-72"
            >
              <Search size={16} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={f.placeholder ?? "Search…"}
                className="bg-transparent outline-none border-0 text-foreground placeholder:text-foreground-subtle w-full text-sm"
              />
            </form>
          );
        }
        return (
          <select
            key={f.name}
            value={params.get(f.name) ?? ""}
            onChange={(e) => update(f.name, e.target.value)}
            className="bg-background border border-white/5 rounded-lg pl-3 pr-8 py-2 text-sm"
          >
            <option value="">{f.label}: All</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {f.label}: {o.label}
              </option>
            ))}
          </select>
        );
      })}
    </div>
  );
}
