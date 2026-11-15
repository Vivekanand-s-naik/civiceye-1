import express from "express";
import { Pool } from "pg";
import reportsRoutes from "./reports";

const router = express.Router();

const pool = new Pool({
  connectionString: "postgresql://postgres:2005@localhost:5432/CivicEyeDB",
});

// ✅ Get all issues
router.get("/api/issues", async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM issues ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching issues:", err);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
});

// ✅ Get all violations
router.get("/api/violations", async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM violators ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching violations:", err);
    res.status(500).json({ error: "Failed to fetch violations" });
  }
});

export default router;
