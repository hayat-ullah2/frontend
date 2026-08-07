import Image from "next/image";
import FilterBar from "@/components/FilterBar";
import CommentActions from "@/components/admin/CommentActions";
import Topbar from "@/components/admin/Topbar";
import { apiServerSafe } from "@/lib/apiServer";
import type { ApiComment } from "@/lib/models";

export default async function AdminCommentsPage(props: PageProps<"/admin/comments">) {
  const sp = await props.searchParams;
  const status = first(sp.status);

  const params = new URLSearchParams({ limit: "100" });
  if (status) params.set("status", status);

  const comments = await apiServerSafe<ApiComment[]>(
    `/comments?${params.toString()}`,
    [],
  );
  const counts = comments.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <>
      <Topbar
        title="Comments"
        subtitle={`${comments.length} comments · ${counts.pending ?? 0} pending · ${counts.flagged ?? 0} flagged`}
      />

      <div className="p-6 space-y-5">
        <div className="grid sm:grid-cols-4 gap-4">
          <Stat label="Showing" value={comments.length} />
          <Stat label="Approved" value={counts.approved ?? 0} />
          <Stat label="Pending" value={counts.pending ?? 0} />
          <Stat label="Flagged" value={counts.flagged ?? 0} />
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <FilterBar
              fields={[
                {
                  type: "select",
                  name: "status",
                  label: "Status",
                  options: [
                    { value: "approved", label: "Approved" },
                    { value: "pending", label: "Pending" },
                    { value: "flagged", label: "Flagged" },
                    { value: "rejected", label: "Rejected" },
                  ],
                },
              ]}
            />
          </div>

          {comments.length === 0 ? (
            <div className="p-12 text-center text-sm text-foreground-subtle">
              No comments match the current filter.
            </div>
          ) : (
            <ul>
              {comments.map((c) => (
                <li
                  key={c._id}
                  className="p-5 border-b border-white/5 last:border-0 flex items-start gap-4"
                >
                  {c.author?.avatar ? (
                    <Image
                      src={c.author.avatar}
                      alt={c.author.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover h-10 w-10 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-accent grid place-items-center text-white text-xs font-bold flex-shrink-0">
                      {initials(c.author?.name ?? "?")}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{c.author?.name}</p>
                      <StatusBadge status={c.status} />
                      <span className="text-xs text-foreground-subtle">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground-muted">{c.content}</p>
                    <p className="mt-3 text-xs text-foreground-subtle line-clamp-1">
                      On: <span className="text-foreground-muted">{c.post?.title}</span>
                    </p>
                  </div>
                  <CommentActions id={c._id} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-foreground-subtle uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
    pending: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    flagged: "text-rose-300 bg-rose-500/10 border-rose-500/20",
    rejected: "text-foreground-subtle bg-white/5 border-white/10",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] rounded-full border capitalize ${map[status]}`}>
      {status}
    </span>
  );
}
