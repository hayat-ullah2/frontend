import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

let configured = false;

export function configureCloudinary() {
  if (configured) return cloudinary;
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    console.warn(
      "[cloudinary] CLOUDINARY_* env vars are missing — uploads will fail.",
    );
  }
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
  configured = true;
  return cloudinary;
}

export { cloudinary };
