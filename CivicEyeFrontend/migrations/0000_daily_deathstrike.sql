ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "plain_password" text;
ALTER TABLE "users" RENAME COLUMN "password_hash" TO "password";
