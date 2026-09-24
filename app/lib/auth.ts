import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { sql } from "./db";

const COOKIE = "loupe_session";
const MAX_AGE_DAYS = 30;

export type CurrentUser = { id: string; username: string; name: string };

/** Create a DB-backed session and set the cookie. */
export async function createSession(userId: string) {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + MAX_AGE_DAYS * 864e5);
  await sql("INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)", [id, userId, expiresAt]);
  (await cookies()).set(COOKIE, id, {
    httpOnly: true,                                   // JS in the page can't read it
    sameSite: "lax",                                  // basic CSRF protection
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/** The signed-in user, or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const id = (await cookies()).get(COOKIE)?.value;
  if (!id) return null;
  const [user] = await sql<CurrentUser>(
    `SELECT u.id, u.username, u.name
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = $1 AND s.expires_at > now()`,
    [id]
  );
  return user ?? null;
}

export async function destroySession() {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (id) await sql("DELETE FROM sessions WHERE id = $1", [id]);
  jar.delete(COOKIE);
}
