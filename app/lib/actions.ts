"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";
import { sql } from "./db";
import { createSession, destroySession, getCurrentUser } from "./auth";
import { UPLOAD_DIR } from "./uploads";

// `values` refills the form after an error (React 19 resets forms after an action).
export type FormState = { error?: string; values?: { username?: string; name?: string } } | undefined;

export async function signup(_: FormState, form: FormData): Promise<FormState> {
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim().slice(0, 50);
  const password = String(form.get("password") ?? "");
  if (!/^[a-z0-9_.]{3,20}$/.test(username))
    return { values: { username, name }, error: "Username must be 3–20 characters: letters, numbers, _ or ." };
  if (!name) return { values: { username, name }, error: "Enter a display name." };
  if (password.length < 8) return { values: { username, name }, error: "Password must be at least 8 characters." };

  const hash = await bcrypt.hash(password, 10);
  const [user] = await sql<{ id: string }>(
    `INSERT INTO users (username, name, password_hash) VALUES ($1, $2, $3)
     ON CONFLICT (username) DO NOTHING RETURNING id`,
    [username, name, hash]
  );
  if (!user) return { values: { username, name }, error: "That username is taken." };
  await createSession(user.id);
  redirect("/");
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const [user] = await sql<{ id: string; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE username = $1", [username]
  );
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return { values: { username }, error: "Wrong username or password." };
  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

async function requireUser() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  return me;
}

/** Like or unlike. Returns the new state. */
export async function toggleLike(postId: string) {
  const me = await requireUser();
  const removed = await sql("DELETE FROM likes WHERE user_id = $1 AND post_id = $2 RETURNING 1", [me.id, postId]);
  if (removed.length === 0)
    await sql("INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [me.id, postId]);
  revalidatePath("/", "layout");
  return removed.length === 0;
}

export async function toggleFollow(userId: string) {
  const me = await requireUser();
  if (userId === me.id) return false;
  const removed = await sql("DELETE FROM follows WHERE follower_id = $1 AND following_id = $2 RETURNING 1", [me.id, userId]);
  if (removed.length === 0)
    await sql("INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [me.id, userId]);
  revalidatePath("/", "layout");
  return removed.length === 0;
}

export async function deletePost(postId: string) {
  const me = await requireUser();
  // author_id check = only your own posts can be deleted
  const [post] = await sql<{ image_file: string }>(
    "DELETE FROM posts WHERE id = $1 AND author_id = $2 RETURNING image_file", [postId, me.id]
  );
  if (post) await unlink(path.join(UPLOAD_DIR, post.image_file)).catch(() => {});
  revalidatePath("/", "layout");
  redirect(`/u/${me.username}`);
}
