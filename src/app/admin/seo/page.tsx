import Topbar from "@/components/admin/Topbar";
import { Check, TrendUp } from "@/components/Icon";

const seoChecks = [
  { label: "Sitemap.xml present", pass: true },
  { label: "Robots.txt configured", pass: true },
  { label: "Canonical URLs on all posts", pass: true },
  { label: "Open Graph images set", pass: true },
  { label: "Structured data (Article schema)", pass: true },
  { label: "Default meta description set", pass: false },
  { label: "404 page customized", pass: false },
];

const keywords = [
  { kw: "agentic llm", pos: 3, change: 2, vol: 4400 },
  { kw: "next.js edge api", pos: 5, change: 1, vol: 2100 },
  { kw: "supply chain attack", pos: 7, change: -1, vol: 9800 },
  { kw: "rust systems programming", pos: 4, change: 3, vol: 3300 },
  { kw: "personal finance stack", pos: 9, change: 0, vol: 1800 },
];

export default function AdminSeoPage() {
  return (
    <>
      <Topbar
        title="SEO management"
        subtitle="Indexing, structured data, and keyword performance."
      />

      <div className="p-6 grid lg:grid-cols-3 gap-6">
        {/* Defaults */}
        <form className="card p-6 space-y-4 lg:col-span-2">
          <h2 className="font-semibold">Site defaults</h2>
          <div>
            <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
              Site title
            </label>
            <input
              defaultValue="NexBlog — Premium multi-niche blog"
              className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
              Default description
            </label>
            <textarea
              rows={3}
              defaultValue="A modern, multi-niche publication covering technology, AI, programming, business, finance, lifestyle and more."
              className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
                Canonical domain
              </label>
              <input
                defaultValue="https://nexblog.example.com"
                className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
                Twitter handle
              </label>
              <input
                defaultValue="@nexblog"
                className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <h3 className="font-semibold mb-3">Indexing</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Toggle label="Allow crawlers" defaultChecked />
              <Toggle label="Auto-generate sitemap.xml" defaultChecked />
              <Toggle label="Emit Article structured data" defaultChecked />
              <Toggle label="Noindex draft posts" defaultChecked />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
            <button className="btn-ghost text-sm">Cancel</button>
            <button className="btn-primary text-sm">Save changes</button>
          </div>
        </form>

        {/* Health */}
        <div className="card p-6 h-fit">
          <h2 className="font-semibold">Site health</h2>
          <p className="text-xs text-foreground-subtle">{seoChecks.filter((c) => c.pass).length}/{seoChecks.length} checks passing</p>
          <ul className="mt-4 space-y-3">
            {seoChecks.map((c) => (
              <li key={c.label} className="flex items-center gap-3 text-sm">
                <span
                  className={`w-6 h-6 rounded-full grid place-items-center ${
                    c.pass ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                  }`}
                >
                  {c.pass ? "✓" : "!"}
                </span>
                <span className={c.pass ? "text-foreground-muted" : "text-foreground"}>
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Keywords */}
        <div className="card lg:col-span-3 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Keyword performance</h2>
              <p className="text-xs text-foreground-subtle">
                Average positions over the last 30 days
              </p>
            </div>
            <button className="btn-ghost text-xs">Export CSV</button>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-foreground-subtle">
              <tr className="border-b border-white/5">
                <th className="text-left p-4 font-medium">Keyword</th>
                <th className="text-right p-4 font-medium">Position</th>
                <th className="text-right p-4 font-medium">Change</th>
                <th className="text-right p-4 font-medium">Monthly volume</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((k) => (
                <tr key={k.kw} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="p-4">{k.kw}</td>
                  <td className="p-4 text-right">#{k.pos}</td>
                  <td className="p-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-xs ${
                        k.change > 0
                          ? "text-emerald-300"
                          : k.change < 0
                          ? "text-rose-300"
                          : "text-foreground-subtle"
                      }`}
                    >
                      {k.change > 0 ? "▲" : k.change < 0 ? "▼" : "—"}{" "}
                      {Math.abs(k.change)}
                    </span>
                  </td>
                  <td className="p-4 text-right text-foreground-muted">{k.vol.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Toggle({
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-background border border-white/5 cursor-pointer">
      <span className="text-sm">{label}</span>
      <span className="relative inline-block w-9 h-5">
        <input
          type="checkbox"
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-white/10 peer-checked:bg-gradient-accent transition" />
        <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
