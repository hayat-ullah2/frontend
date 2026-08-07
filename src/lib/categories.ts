import { api } from "./api";
import type { ApiCategory } from "./models";

export type CategoryInput = {
  name: string;
  description?: string;
  color?: string;
};

export function createCategory(input: CategoryInput) {
  return api<ApiCategory>("/categories", { method: "POST", json: input });
}
export function updateCategory(slug: string, input: Partial<CategoryInput>) {
  return api<ApiCategory>(`/categories/${slug}`, { method: "PATCH", json: input });
}
export function deleteCategory(slug: string) {
  return api<{ success: true }>(`/categories/${slug}`, { method: "DELETE" });
}
