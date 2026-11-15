

// seedData();
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from "../shared/schema";
import { users, reward_wallets } from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

export const db = drizzle(client, { schema });

async function seedData() {
  try {
    // Clean existing data
    await db.delete(reward_wallets);
    await db.delete(users);

    // Insert default users
    await db.insert(users).values([
      {
        authorityId: "auth1",
        email: "authority@civiceye.com",
        password: "password",
        fullName: "Authority Officer",
        phoneNumber: "+91-9999999998",
        aadharNumber: "123412342222", // keep as text
        role: "AUTHORITY",
        isActive: true,
        zone: "Zone-A",
        createdAt: new Date().toISOString(),
      },
      {
        authorityId: "cit1",
        email: "citizen@civiceye.com",
        password: "password",
        fullName: "Test Citizen",
        phoneNumber: "+91-9999999997",
        aadharNumber: "123412343333",
        role: "CITIZEN",
        isActive: true,
        zone: null,
        createdAt: new Date().toISOString(),
      },
      {
        authorityId: "admin1",
        email: "shreeveeraganapati15@gmail.com",
        password: "password",
        fullName: "System Administrator",
        phoneNumber: "+91-9999999999",
        aadharNumber: "123412341111",
        role: "ADMIN",
        isActive: true,
        zone: null,
        createdAt: new Date().toISOString(),
      },
    ]);

    console.log("✅ Seeded database successfully");
  } catch (error) {
    console.error("❌ Failed to seed database:", error);
  }

seedData();
}