import Image from "next/image";
import Topbar from "@/components/admin/Topbar";
import { Edit, Plus, Search, Trash, Users } from "@/components/Icon";
import { authors } from "@/lib/data";

const roles = ["Admin", "Editor", "Writer", "Reader"];
const extraUsers = [
  { name: "Hana Park", email: "hana@nexblog.com", role: "Reader", joined: "2026-05-10", status: "Active" },
  { name: "Daniel Okafor", email: "daniel@nexblog.com", role: "Reader", joined: "2026-04-22", status: "Active" },
  { name: "Ivy Tanaka", email: "ivy@nexblog.com", role: "Writer", joined: "2026-03-18", status: "Active" },
  { name: "Noah Becker", email: "noah@nexblog.com", role: "Reader", joined: "2026-06-02", status: "Pending" },
  { name: "Aisha Karim", email: "aisha@nexblog.com", role: "Editor", joined: "2026-01-09", status: "Active" },
  { name: "Lukas Meier", email: "lukas@nexblog.com", role: "Reader", joined: "2026-02-12", status: "Banned" },
];

export default function AdminUsersPage() {
  const users = [
    ...authors.map((a, i) => ({
      name: a.name,
      email: `${a.slug.split("-")[0]}@nexblog.com`,
      role: i === 0 ? "Admin" : i < 3 ? "Editor" : "Writer",
      joined: "2025-08-04",
      status: "Active",
      avatar: a.avatar,
    })),
    ...extraUsers.map((u) => ({ ...u, avatar: undefined as string | undefined })),
  ];

  return (
    <>
      <Topbar
        title="User management"
        subtitle={`${users.length} accounts · 4 awaiting approval`}
        action={
          <button className="btn-primary text-sm">
            <Plus size={14} /> Invite user
          </button>
        }
      />

      <div className="p-6 space-y-5">
        <div className="grid sm:grid-cols-4 gap-4">
          <Stat label="Total users" value={users.length.toString()} />
          <Stat label="Active" value={users.filter((u) => u.status === "Active").length.toString()} />
          <Stat label="Pending" value={users.filter((u) => u.status === "Pending").length.toString()} />
          <Stat label="Banned" value={users.filter((u) => u.status === "Banned").length.toString()} />
        </div>

        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-white/5 w-full md:w-72">
              <Search size={16} />
              <input
                placeholder="Search by name or email…"
                className="bg-transparent outline-none border-0 text-foreground placeholder:text-foreground-subtle w-full text-sm"
              />
            </div>
            <select className="bg-background border border-white/5 rounded-lg px-3 py-2 text-sm">
              <option>All roles</option>
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <select className="bg-background border border-white/5 rounded-lg px-3 py-2 text-sm">
              <option>All statuses</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Banned</option>
            </select>
          </div>

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
              {users.map((u, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
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
                        <div className="w-9 h-9 rounded-full bg-white/5 grid place-items-center text-xs text-foreground-muted">
                          <Users size={14} />
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
                  <td className="p-4 hidden lg:table-cell text-foreground-muted">{u.joined}</td>
                  <td className="p-4">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex gap-1">
                      <button className="w-8 h-8 rounded-lg border border-white/5 hover:bg-white/5 grid place-items-center text-foreground-muted">
                        <Edit size={14} />
                      </button>
                      <button className="w-8 h-8 rounded-lg border border-white/5 hover:bg-rose-500/10 grid place-items-center text-rose-300">
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    Active: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
    Pending: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    Banned: "text-rose-300 bg-rose-500/10 border-rose-500/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full border ${
        map[status] ?? "text-foreground-subtle border-white/10"
      }`}
    >
      {status}
    </span>
  );
}
