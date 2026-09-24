import "server-only";
import { Pool, type QueryResultRow } from "pg";

// One connection pool, reused across hot reloads in dev.
const g = globalThis as unknown as { pool?: Pool };
const pool = g.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") g.pool = pool;

/** Run a parameterized query ($1, $2, …). Never build SQL by string concatenation. */
export async function sql<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  const res = await pool.query<T>(text, params);
  return res.rows;
}
