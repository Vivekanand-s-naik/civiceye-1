import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorityId: varchar("authority_id"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  aadharNumber: text("aadhar_number").notNull(),
  phoneNumber: text("phone_number"),
  role: text("role").notNull(),
  isActive: boolean("is_active").default(true),
  zone: text("zone").default(sql`NULL`),
  createdAt: text("created_at"),
});

export const reward_wallets = pgTable("reward_wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  balance: integer("balance").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).extend({
  authorityId: z.string(),
  email: z.string(),
  password: z.string(),
  fullName: z.string(),
  aadharNumber: z.string(),
  phoneNumber: z.string().optional(),
  role: z.string(),
  isActive: z.boolean().default(true),
  zone: z.string().optional(),
  createdAt: z.string(),
}).pick({
  authorityId: true,
  email: true,
  password: true,
  aadharNumber: true,
  fullName: true,
  phoneNumber: true,
  role: true,
  isActive: true,
  zone: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
