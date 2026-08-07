import Image from "next/image";
import FilterBar from "@/components/FilterBar";
import Topbar from "@/components/admin/Topbar";
import UserRowActions from "@/components/admin/UserRowActions";
import { Plus, Users } from "@/components/Icon";
import { apiServerSafe, apiServerWithMeta } from "@/lib/apiServer";
import type { ApiUser, UserStats } from "@/lib/models";

const EMPTY_STATS: UserStats = {
  total: 0,
  active: 0,
  pending: 0,
  banned: 0,
  byRole: {},
};

export default async function AdminUsersPage(props: PageProps<"/admin/users">) {
  const sp = await props.searchParams;
  const q = first(sp.q);
  const role = first(sp.role);
  const status = first(sp.status);

  const params = new URLSearchParams({ limit: "100" });
  if (q) params.set("q", q);
  if (role) params.set("role", role);
  if (status) params.set("status", status);

  const stats = await apiServerSafe<UserStats>("/users/stats", EMPTY_STATS);
  let users: ApiUser[] = [];
  let total = 0;
  try {
    const { data, meta } = await apiServerWithMeta<ApiUser[]>(`/users?${params.toString()}`);
    users = data;
    total = (meta?.total as number) ?? data.length;
  } catch {
    /* not authenticated as admin */
  }

  return (
    <>
      <Topbar
        title="User management"
        subtitle={`${stats.total} accounts · ${stats.active} active · ${stats.pending} pending · ${stats.banned} banned`}
        action={
          <button className="btn-primary text-sm" title="Invite via email (not yet wired)">
            <Plus size={14} /> Invite user
          </button>
        }
      />

      <div className="p-6 space-y-5">
        <div className="grid sm:grid-cols-4 gap-4">
          <Stat label="Total users" value={stats.total} />
          <Stat label="Active" value={stats.active} />
          <Stat label="Pending" value={stats.pending} />
          <Stat label="Banned" value={stats.banned} />
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-b border-white/5 flex flex-wrap items-center gap-3">
            <FilterBar
              fields={[
                { type: "search", name: "q", placeholder: "Search by name or email…" },
                {
                  type: "select",
                  name: "role",
                  label: "Role",
                  options: [
                    { value: "admin", label: "Admin" },
                    { value: "editor", label: "Editor" },
                    { value: "writer", label: "Writer" },
                    { value: "reader", label: "Reader" },
                  ],
                },
                {
                  type: "select",
                  name: "status",
                  label: "Status",
                  options: [
                    { value: "active", label: "Active" },
                    { value: "pending", label: "Pending" },
                    { value: "banned", label: "Banned" },
                  ],
                },
              ]}
            />
            <span className="ml-auto text-xs text-foreground-subtle">
              Showing {users.length} of {total}
            </span>
          </div>

          {users.length === 0 ? (
            <div className="p-10 text-center text-sm text-foreground-subtle">
              <Users size={20} />
              <p className="mt-3">
                No users match. Either nobody fits the filter or you need to log in
                as an admin.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-foreground-subtle">
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Role</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Joined</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <Image
                            src={u.avatar}
                            alt={u.name}
                            width={36}
                            height={36}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-accent grid place-items-center text-white text-xs font-bold">
                            {initials(u.name)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-foreground-subtle">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="chip">{u.role}</span>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-foreground-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="p-4 text-right">
                      <UserRowActions user={u} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    active: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
    pending: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    banned: "text-rose-300 bg-rose-500/10 border-rose-500/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full border capitalize ${
        map[status] ?? "text-foreground-subtle border-white/10"
      }`}
    >
      {status}
    </span>
  );
}
