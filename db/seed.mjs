// Creates two demo accounts so you can try following and liking.
// Run: npm run db:seed    (password for both: password123)
import pg from "pg";
import bcrypt from "bcryptjs";
import { loadEnv } from "./env.mjs";

loadEnv();
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const hash = await bcrypt.hash("password123", 10);
for (const [username, name] of [["alice", "Alice Tremblay"], ["bob", "Bob Nguyen"]]) {
  await client.query(
    "INSERT INTO users (username, name, password_hash) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING",
    [username, name, hash]
  );
  console.log(`Seeded @${username} / password123`);
}
await client.end();
