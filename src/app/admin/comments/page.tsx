import Image from "next/image";
import Topbar from "@/components/admin/Topbar";
import { Check, Close, Search, Trash } from "@/components/Icon";
import { comments, posts } from "@/lib/data";

const moderationQueue = [
  ...comments.map((c) => ({ ...c, status: "Approved" as const })),
  {
    id: "c4",
    postSlug: posts[1].slug,
    author: "Anon",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80&auto=format&fit=crop",
    date: "2026-06-20",
    content: "This is great — saving for later. (Probably spam in real life.)",
    likes: 0,
    status: "Pending" as const,
  },
  {
    id: "c5",
    postSlug: posts[2].slug,
    author: "TrollBot",
    avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=120&q=80&auto=format&fit=crop",
    date: "2026-06-21",
    content: "Buy cheap watches at example.com — flagged for review.",
    likes: 0,
    status: "Flagged" as const,
  },
];

export default function AdminCommentsPage() {
  return (
    <>
      <Topbar
        title="Comments"
        subtitle={`${moderationQueue.length} comments · 1 pending · 1 flagged`}
      />

      <div className="p-6 space-y-5">
        <div className="grid sm:grid-cols-4 gap-4">
          <Stat label="Total" value={moderationQueue.length.toString()} />
          <Stat label="Approved" value={moderationQueue.filter((c) => c.status === "Approved").length.toString()} />
          <Stat label="Pending" value={moderationQueue.filter((c) => c.status === "Pending").length.toString()} />
          <Stat label="Flagged" value={moderationQueue.filter((c) => c.status === "Flagged").length.toString()} />
        </div>

        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-white/5 w-full md:w-72">
              <Search size={16} />
              <input
                placeholder="Search comments…"
                className="bg-transparent outline-none border-0 text-foreground placeholder:text-foreground-subtle w-full text-sm"
              />
            </div>
            <select className="bg-background border border-white/5 rounded-lg px-3 py-2 text-sm">
              <option>All statuses</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Flagged</option>
            </select>
            <div className="ml-auto flex items-center gap-2">
              <button className="btn-ghost text-xs">Bulk approve</button>
              <button className="btn-ghost text-xs">Bulk delete</button>
            </div>
          </div>

          <ul>
            {moderationQueue.map((c) => {
              const post = posts.find((p) => p.slug === c.postSlug);
              return (
                <li
                  key={c.id}
                  className="p-5 border-b border-white/5 last:border-0 flex items-start gap-4"
                >
                  <Image
                    src={c.avatar}
                    alt={c.author}
                    width={40}
                    height={40}
                    className="rounded-full object-cover h-10 w-10 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{c.author}</p>
                      <StatusBadge status={c.status} />
                      <span className="text-xs text-foreground-subtle">{c.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-foreground-muted">{c.content}</p>
                    <p className="mt-3 text-xs text-foreground-subtle line-clamp-1">
                      On: <span className="text-foreground-muted">{post?.title}</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Action tone="approve" label="Approve">
                      <Check size={14} />
                    </Action>
                    <Action tone="reject" label="Reject">
                      <Close size={14} />
                    </Action>
                    <Action tone="delete" label="Delete">
                      <Trash size={14} />
                    </Action>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-foreground-subtle uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Approved: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
    Pending: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    Flagged: "text-rose-300 bg-rose-500/10 border-rose-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] rounded-full border ${map[status]}`}>
      {status}
    </span>
  );
}

function Action({
  children,
  tone,
  label,
}: {
  children: React.ReactNode;
  tone: "approve" | "reject" | "delete";
  label: string;
}) {
  const map = {
    approve: "text-emerald-300 hover:bg-emerald-500/10",
    reject: "text-amber-300 hover:bg-amber-500/10",
    delete: "text-rose-300 hover:bg-rose-500/10",
  } as const;
  return (
    <button
      aria-label={label}
      className={`w-8 h-8 rounded-lg border border-white/5 grid place-items-center transition ${map[tone]}`}
    >
      {children}
    </button>
  );
}
