import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { revalidatePath } from "next/cache";
import { sql } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";
import { UPLOAD_DIR, MAX_BYTES, TYPES } from "@/app/lib/uploads";

// POST /api/posts  (multipart form: image, caption)
export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Log in to post." }, { status: 401 });

  const form = await req.formData();
  const file = form.get("image");
  const caption = String(form.get("caption") ?? "").trim().slice(0, 2200);

  if (!(file instanceof File) || file.size === 0)
    return NextResponse.json({ error: "Choose a photo." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Use a JPG, PNG, WebP or GIF." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Photo must be 8 MB or smaller." }, { status: 400 });

  const imageFile = `${randomUUID()}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, imageFile), Buffer.from(await file.arrayBuffer()));

  const [post] = await sql<{ id: string }>(
    "INSERT INTO posts (author_id, image_file, caption) VALUES ($1, $2, $3) RETURNING id",
    [me.id, imageFile, caption]
  );
  revalidatePath("/", "layout");
  return NextResponse.json({ id: post.id }, { status: 201 });
}
