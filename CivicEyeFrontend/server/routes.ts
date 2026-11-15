import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "../shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log("Received email:", email);
    console.log("Received password:", password);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const foundUsers = await db.select().from(users).where(eq(users.email, trimmedEmail));
      
      if (!foundUsers || foundUsers.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const user = foundUsers[0];

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const passwordMatch = password === user.password;
      console.log("User from DB:", user);
      console.log("Password match:", passwordMatch);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      return res.status(200).json({
        role: user.role,
        fullName: user.fullName,
        email: user.email,
      });
    } catch (error) {
      console.error("Login error:", error, (error as any).message, (error as any).stack);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}


const router = express.Router();

