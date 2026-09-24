import path from "path";

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
export const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
export const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
export const MIME_BY_EXT: Record<string, string> = Object.fromEntries(
  Object.entries(TYPES).map(([mime, ext]) => [ext, mime])
);
