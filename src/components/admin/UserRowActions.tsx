"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Edit, Trash } from "@/components/Icon";
import { ApiError } from "@/lib/api";
import type { ApiUser } from "@/lib/models";
import { deleteUser, updateUser } from "@/lib/users";

const ROLES: ApiUser["role"][] = ["reader", "writer", "editor", "admin"];

export default function UserRowActions({ user }: { user: ApiUser }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState<ApiUser["role"]>(user.role);
  const [pending, start] = useTransition();

  function save() {
    if (role === user.role) {
      setEditing(false);
      return;
    }
    start(async () => {
      try {
        await updateUser(user._id, { role });
        setEditing(false);
        router.refresh();
      } catch (err) {
        alert(err instanceof ApiError ? err.message : "Update failed.");
      }
    });
  }

  function remove() {
    if (!confirm(`Delete user "${user.name}" (${user.email})?`)) return;
    start(async () => {
      try {
        await deleteUser(user._id);
        router.refresh();
      } catch (err) {
        alert(err instanceof ApiError ? err.message : "Delete failed.");
      }
    });
  }

  return (
    <div className="inline-flex items-center gap-1">
      {editing ? (
        <div className="inline-flex items-center gap-1">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as ApiUser["role"])}
            className="bg-background border border-white/10 rounded-md px-2 py-1 text-xs"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="text-xs px-2 py-1 rounded-md bg-gradient-accent text-white disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setRole(user.role);
              setEditing(false);
            }}
            className="text-xs px-2 py-1 rounded-md text-foreground-muted hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-8 h-8 rounded-lg border border-white/5 hover:bg-white/5 grid place-items-center text-foreground-muted"
            aria-label="Edit role"
          >
            <Edit size={14} />
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="w-8 h-8 rounded-lg border border-white/5 hover:bg-rose-500/10 grid place-items-center text-rose-300 disabled:opacity-50"
            aria-label="Delete"
          >
            <Trash size={14} />
          </button>
        </>
      )}
    </div>
  );
}
