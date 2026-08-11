import Link from "next/link";
import Topbar from "@/components/admin/Topbar";
import { ArrowRight, BarChart, Eye, Heart, Mail, Tag, TrendUp, Users } from "@/components/Icon";
import { apiServerSafe } from "@/lib/apiServer";
import type { AnalyticsSummary } from "@/lib/models";

const EMPTY: AnalyticsSummary = {
  windowDays: 30,
  traffic: { pageviews: 0, uniqueVisitors: 0 },
  engagement: { outboundClicks: 0, ctaClicks: 0, productClicks: 0, newsletterSignups: 0 },
  affiliate: { clicksInWindow: 0, totalClicks: 0, earnings: 0, epc: 0, topLinks: [] },
  email: { subscribers: 0, newInWindow: 0, signupConversion: 0 },
  content: { publishedPosts: 0, topPosts: [] },
};

export default async function AdminRevenuePage() {
  const s = await apiServerSafe<AnalyticsSummary>("/events/summary?days=30", EMPTY);

  const kpis = [
    { label: "Pageviews", value: fmt(s.traffic.pageviews), sub: "last 30 days", icon: Eye },
    { label: "Unique visitors", value: fmt(s.traffic.uniqueVisitors), sub: "last 30 days", icon: Users },
    { label: "Affiliate clicks", value: fmt(s.affiliate.clicksInWindow), sub: `${fmt(s.affiliate.totalClicks)} all-time`, icon: Tag },
    { label: "Logged earnings", value: `$${fmt(s.affiliate.earnings)}`, sub: `EPC $${s.affiliate.epc.toFixed(2)}`, icon: TrendUp },
  ];

  return (
    <>
      <Topbar
        title="Revenue & analytics"
        subtitle="First-party metrics over the last 30 days. Connect Search Console + your ad network for the full picture."
      />

      <div className="p-6 space-y-6">
        {/* KPI row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-foreground-subtle uppercase tracking-wider">{k.label}</p>
                  <div className="w-9 h-9 rounded-xl bg-white/5 grid place-items-center text-foreground-muted">
                    <Icon size={16} />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">{k.value}</p>
                <p className="mt-1 text-xs text-foreground-subtle">{k.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Affiliate */}
          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Affiliate performance</h2>
                <p className="text-xs text-foreground-subtle">Tracked outbound clicks by tool</p>
              </div>
              <Link href="/admin/affiliate" className="text-xs text-foreground-muted hover:text-foreground inline-flex items-center gap-1">
                Manage tools <ArrowRight size={12} />
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4">
              <Metric label="Total clicks" value={fmt(s.affiliate.totalClicks)} />
              <Metric label="Est. EPC" value={`$${s.affiliate.epc.toFixed(2)}`} />
              <Metric label="Logged earnings" value={`$${fmt(s.affiliate.earnings)}`} />
            </div>
            <div className="mt-6">
              {s.affiliate.topLinks.length === 0 ? (
                <EmptyRow>
                  No clicks yet. Add tools in{" "}
                  <Link href="/admin/affiliate" className="underline">Affiliate</Link>, attach them to
                  articles, and clicks will appear here.
                </EmptyRow>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-xs text-foreground-subtle">
                    <tr className="border-b border-white/5">
                      <th className="text-left py-2 font-medium">Tool</th>
                      <th className="text-right py-2 font-medium">Clicks</th>
                      <th className="text-right py-2 font-medium">EPC</th>
                      <th className="text-right py-2 font-medium">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.affiliate.topLinks.map((l) => (
                      <tr key={l._id} className="border-b border-white/5 last:border-0">
                        <td className="py-2.5">{l.name}</td>
                        <td className="py-2.5 text-right tabular-nums">{fmt(l.clicks)}</td>
                        <td className="py-2.5 text-right tabular-nums">{l.epc ? `$${l.epc.toFixed(2)}` : "—"}</td>
                        <td className="py-2.5 text-right tabular-nums">{l.earnings ? `$${fmt(l.earnings)}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-foreground-muted" />
              <h2 className="font-semibold">Email</h2>
            </div>
            <div className="mt-5 space-y-4">
              <Metric label="Subscribers" value={fmt(s.email.subscribers)} big />
              <div className="grid grid-cols-2 gap-4">
                <Metric label="New (30d)" value={fmt(s.email.newInWindow)} />
                <Metric label="Signup rate" value={`${s.email.signupConversion}%`} />
              </div>
              <p className="text-xs text-foreground-subtle">
                Signup rate = new subscribers ÷ unique visitors (30d).
              </p>
            </div>
          </div>
        </div>

        {/* Engagement + Top content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <BarChart size={16} className="text-foreground-muted" />
              <h2 className="font-semibold">Engagement (30d)</h2>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Metric label="Product clicks" value={fmt(s.engagement.productClicks)} />
              <Metric label="CTA clicks" value={fmt(s.engagement.ctaClicks)} />
              <Metric label="Outbound clicks" value={fmt(s.engagement.outboundClicks)} />
              <Metric label="Signups" value={fmt(s.engagement.newsletterSignups)} />
            </div>
          </div>

          <div className="card lg:col-span-2 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Top content by views</h2>
                <p className="text-xs text-foreground-subtle">{fmt(s.content.publishedPosts)} published posts</p>
              </div>
              <Link href="/admin/blogs" className="text-xs text-foreground-muted hover:text-foreground inline-flex items-center gap-1">
                All posts <ArrowRight size={12} />
              </Link>
            </div>
            {s.content.topPosts.length === 0 ? (
              <EmptyRow>No published posts yet.</EmptyRow>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs text-foreground-subtle">
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 font-medium">Title</th>
                    <th className="text-right p-4 font-medium">Views</th>
                    <th className="text-right p-4 font-medium">Likes</th>
                  </tr>
                </thead>
                <tbody>
                  {s.content.topPosts.map((p) => (
                    <tr key={p._id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="p-4">
                        <Link href={`/blog/${p.slug}`} className="font-medium hover:underline line-clamp-1">
                          {p.title}
                        </Link>
                      </td>
                      <td className="p-4 text-right tabular-nums text-foreground-muted">
                        <span className="inline-flex items-center gap-1"><Eye size={12} /> {fmt(p.views)}</span>
                      </td>
                      <td className="p-4 text-right tabular-nums text-foreground-muted">
                        <span className="inline-flex items-center gap-1"><Heart size={12} /> {fmt(p.likes)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Not-yet-connected channels — honest placeholders */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ConnectCard
            title="Search Console (SEO)"
            body="Impressions, clicks, CTR, average position, top keywords and landing pages come from Google Search Console. Verify the domain and connect the API to populate this."
          />
          <ConnectCard
            title="Display advertising"
            body="RPM and ad revenue populate once you're approved by an ad network (AdSense, Ezoic or Mediavine) and the ad script is installed. Complete the ads-readiness checklist first."
          />
        </div>

        <p className="text-xs text-foreground-subtle">
          Metrics above are first-party (your own tracking). They exclude bots imperfectly and are
          for direction, not accounting — reconcile affiliate earnings against each network&apos;s
          own dashboard.
        </p>
      </div>
    </>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n ?? 0);
}

function Metric({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div>
      <p className="text-xs text-foreground-subtle uppercase tracking-wider">{label}</p>
      <p className={`mt-1 font-bold tabular-nums ${big ? "text-3xl" : "text-xl"}`}>{value}</p>
    </div>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return <div className="py-8 text-center text-xs text-foreground-subtle">{children}</div>;
}

function ConnectCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-6 border-dashed">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-[10px] uppercase tracking-wider text-amber-300 border border-amber-500/30 rounded px-2 py-0.5">
          Not connected
        </span>
      </div>
      <p className="mt-2 text-sm text-foreground-muted leading-relaxed">{body}</p>
    </div>
  );
}
