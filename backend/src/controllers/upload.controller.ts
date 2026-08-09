import type { Request, Response } from "express";
import { Readable } from "node:stream";
import { configureCloudinary } from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

type UploadResult = {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
};

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) throw ApiError.badRequest("No file provided (field name: 'file').");

  const cloudinary = configureCloudinary();

  let result: UploadResult;
  try {
    result = await new Promise<UploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: env.cloudinary.folder,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (err, uploaded) => {
          if (err || !uploaded) return reject(err ?? new Error("Upload failed"));
          resolve(uploaded as UploadResult);
        },
      );
      Readable.from(req.file!.buffer).pipe(stream);
    });
  } catch (err) {
    const cloudErr = err as { message?: string; http_code?: number };
    // Cloudinary auth errors (401) are *our* server's misconfiguration, not the
    // user's auth problem. Map to 502 so the frontend doesn't mistake it for a
    // session issue. Only forward 4xx codes that genuinely reflect bad input.
    const upstream = cloudErr.http_code;
    const status =
      upstream === 400 || upstream === 413 || upstream === 415 ? upstream : 502;
    throw new ApiError(
      status,
      `Cloudinary: ${cloudErr.message ?? "upload failed"}`,
    );
  }

  res.status(201).json({
    success: true,
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    },
  });
}
