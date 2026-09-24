// Applies db/schema.sql to DATABASE_URL.  Run: npm run db:migrate
import { readFile } from "fs/promises";
import pg from "pg";
import { loadEnv } from "./env.mjs";

loadEnv();
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query(await readFile(new URL("./schema.sql", import.meta.url), "utf8"));
await client.end();
console.log("Schema is up to date.");
