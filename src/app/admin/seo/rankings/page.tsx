import Link from "next/link";
import Topbar from "@/components/admin/Topbar";
import { apiServerSafe } from "@/lib/apiServer";

export const dynamic = "force-dynamic";

type RankingRow = {
  query: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type ProviderResult = {
  available: boolean;
  source: string;
  data?: RankingRow[];
  note?: string;
};

export default async function SeoRankingsPage() {
  const result = await apiServerSafe<ProviderResult | null>("/seo/rankings", null);

  const available = result?.available === true;
  const rows = result?.data ?? [];

  return (
    <>
      <Topbar
        title="Rankings & quick wins"
        subtitle="Queries close to page one — real Search Console data only."
      />

      <div className="p-6 space-y-6">
        {!available ? (
          <div className="card p-6">
            <p className="text-sm text-foreground-muted">Data unavailable</p>
            {result?.note && (
              <p className="text-xs text-foreground-subtle mt-2">{result.note}</p>
            )}
            <p className="text-xs text-foreground-subtle mt-2">
              Connect Google Search Console in Settings to see real ranking data.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="font-semibold">Quick wins</h2>
              <p className="text-xs text-foreground-subtle mt-1">
                Queries where nexversal.com ranks in positions 8–20 — small improvements can
                reach page one. Source: Google Search Console.
              </p>
            </div>
            {rows.length === 0 ? (
              <p className="p-5 text-sm text-foreground-subtle">No quick-win queries right now.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-foreground-subtle border-b border-white/5">
                      <th className="p-4 font-medium">Query</th>
                      <th className="p-4 font-medium">Page</th>
                      <th className="p-4 font-medium text-right">Impressions</th>
                      <th className="p-4 font-medium text-right">CTR</th>
                      <th className="p-4 font-medium text-right">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr
                        key={`${r.query}-${i}`}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                      >
                        <td className="p-4 text-foreground">{r.query}</td>
                        <td className="p-4">
                          {r.page ? (
                            <Link
                              href={r.page}
                              className="text-foreground-muted hover:text-foreground break-all"
                            >
                              {r.page}
                            </Link>
                          ) : (
                            <span className="text-foreground-subtle">—</span>
                          )}
                        </td>
                        <td className="p-4 text-right tabular-nums">
                          {r.impressions.toLocaleString("en-US")}
                        </td>
                        <td className="p-4 text-right tabular-nums">
                          {(r.ctr * 100).toFixed(1)}%
                        </td>
                        <td className="p-4 text-right tabular-nums">{r.position.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
