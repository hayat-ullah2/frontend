import { api } from "./api";
import type { ApiUser } from "./models";

export function updateUser(
  id: string,
  input: Partial<{
    role: ApiUser["role"];
    status: ApiUser["status"];
    name: string;
    bio: string;
  }>,
) {
  return api<ApiUser>(`/users/${id}`, { method: "PATCH", json: input });
}

export function deleteUser(id: string) {
  return api<{ success: true }>(`/users/${id}`, { method: "DELETE" });
}
