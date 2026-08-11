import Topbar from "@/components/admin/Topbar";
import { Mail, TrendUp, Users } from "@/components/Icon";
import { apiServerWithMeta } from "@/lib/apiServer";
import type { ApiSubscriber } from "@/lib/models";

export default async function AdminSubscribersPage() {
  let subs: ApiSubscriber[] = [];
  let total = 0;
  let active = 0;
  try {
    const r = await apiServerWithMeta<ApiSubscriber[]>("/subscribers?limit=100");
    subs = r.data;
    total = Number(r.meta?.total ?? subs.length);
    active = Number(r.meta?.active ?? 0);
  } catch {
    /* backend unreachable — render an empty state */
  }
  const unsubscribed = Math.max(0, total - active);

  const cards = [
    { label: "Total subscribers", value: total, sub: "all time", icon: Users },
    { label: "Active", value: active, sub: "currently subscribed", icon: Mail },
    { label: "Unsubscribed", value: unsubscribed, sub: "opted out", icon: TrendUp },
  ];

  return (
    <>
      <Topbar
        title="Audience"
        subtitle={`${active} active subscribers · ${total} all time`}
      />
      <div className="p-6 space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-foreground-subtle uppercase tracking-wider">{c.label}</p>
                  <div className="w-9 h-9 rounded-xl bg-white/5 grid place-items-center text-foreground-muted">
                    <Icon size={16} />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{c.value}</p>
                <p className="mt-1 text-xs text-foreground-subtle">{c.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="card overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-semibold">Recent subscribers</h2>
            <p className="text-xs text-foreground-subtle">Newest first · showing up to 100</p>
          </div>
          {subs.length === 0 ? (
            <div className="p-12 text-center text-sm text-foreground-subtle">
              No subscribers yet. Add a lead magnet or newsletter CTA to your articles to start
              growing the list.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="text-xs text-foreground-subtle">
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Source</th>
                    <th className="text-left p-4 font-medium">Welcome</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => {
                    const isUnsub = !!s.unsubscribedAt;
                    return (
                      <tr key={s._id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                        <td className="p-4">
                          <p className="font-medium">{s.email}</p>
                          {s.name && <p className="text-xs text-foreground-subtle">{s.name}</p>}
                        </td>
                        <td className="p-4 text-foreground-muted">
                          <span className="chip">{s.source ?? "site"}</span>
                        </td>
                        <td className="p-4 text-foreground-muted">
                          {s.welcomeDone ? "Complete" : `Step ${(s.welcomeStep ?? 0)} / 4`}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] uppercase tracking-wider rounded px-2 py-0.5 border ${
                              isUnsub
                                ? "text-rose-300 border-rose-500/30"
                                : "text-emerald-300 border-emerald-500/30"
                            }`}
                          >
                            {isUnsub ? "Unsubscribed" : "Active"}
                          </span>
                        </td>
                        <td className="p-4 text-right text-foreground-subtle tabular-nums">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
