import { api } from "./api";
import type { ApiComment } from "./models";

export function postComment(slug: string, content: string) {
  return api<ApiComment>(`/posts/${slug}/comments`, {
    method: "POST",
    json: { content },
  });
}
export function updateCommentStatus(
  id: string,
  status: ApiComment["status"],
) {
  return api<ApiComment>(`/comments/${id}/status`, {
    method: "PATCH",
    json: { status },
  });
}
export function deleteComment(id: string) {
  return api<{ success: true }>(`/comments/${id}`, { method: "DELETE" });
}
