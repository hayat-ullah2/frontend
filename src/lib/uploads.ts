import { API_BASE_URL, ApiError } from "./api";

export type UploadedImage = {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
};

export async function uploadImage(file: File): Promise<UploadedImage> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_BASE_URL}/uploads/image`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });

  let body: { success: boolean; data?: UploadedImage; error?: { message: string } } | null = null;
  try {
    body = await res.json();
  } catch {
    /* non-json */
  }

  if (!res.ok || !body || body.success === false || !body.data) {
    throw new ApiError(
      res.status,
      body?.error?.message || res.statusText || "Upload failed",
    );
  }
  return body.data;
}
