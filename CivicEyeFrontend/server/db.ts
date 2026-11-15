import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "../shared/schema";

// Ensure environment is loaded even if db.ts is imported directly
const envPaths = [
  path.resolve(process.cwd(), "..", ".env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../..", ".env"),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  const user = process.env.PGUSER;
  const pass = process.env.PGPASSWORD;
  const host = process.env.PGHOST || "localhost";
  const port = process.env.PGPORT || "5432";
  const dbName = process.env.PGDATABASE || "CivicEyeDB";
  if (user && pass) {
    connectionString = `postgresql://${user}:${pass}@${host}:${port}/${dbName}`;
  }
}

if (!connectionString) {
  throw new Error("DATABASE_URL or PostgreSQL credentials (PGUSER, PGPASSWORD) must be set in .env");
}

export const pool = new Pool({
  connectionString,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export const db = drizzle(pool, { schema });
