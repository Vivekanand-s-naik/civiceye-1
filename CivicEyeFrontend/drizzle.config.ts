import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { defineConfig } from "drizzle-kit";

const envPaths = [
  path.resolve(process.cwd(), "..", ".env"),
  path.resolve(process.cwd(), ".env"),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

if (!process.env.DATABASE_URL) {
  const user = process.env.PGUSER;
  const pass = process.env.PGPASSWORD;
  const host = process.env.PGHOST || "localhost";
  const port = process.env.PGPORT || "5432";
  const dbName = process.env.PGDATABASE || "CivicEyeDB";
  if (user && pass) {
    process.env.DATABASE_URL = `postgresql://${user}:${pass}@${host}:${port}/${dbName}`;
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned in .env");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
