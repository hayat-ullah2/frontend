import { configureCloudinary } from "../config/cloudinary.js";

/**
 * Best-effort: try to delete a Cloudinary asset by public_id.
 * Never throws — failures are logged but should not block the calling controller.
 */
export async function destroyAsset(publicId: string | undefined | null) {
  if (!publicId) return;
  try {
    const cloudinary = configureCloudinary();
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (err) {
    console.warn(`[cloudinary] destroy(${publicId}) failed:`, (err as Error).message);
  }
}
