import { readFile } from "fs/promises";
import path from "path";
import { UPLOAD_DIR, MIME_BY_EXT } from "@/app/lib/uploads";

// GET /api/images/<file>  serves an uploaded photo
export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/.test(file)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(UPLOAD_DIR, file));
    return new Response(data, {
      headers: {
        "Content-Type": MIME_BY_EXT[file.split(".").pop()!],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
