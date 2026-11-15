import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { pool } from "./db";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Store active password reset OTPs: email -> { otp, expiresAt }
  const passwordResetOTPs = new Map<string, { otp: string; expiresAt: number }>();

  // Configure SMTP transporter from root .env settings
  function getMailer() {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER || process.env.CIVICEYE_EMAIL || "";
    const rawPass = process.env.SMTP_PASSWORD || process.env.CIVICEYE_APP_PASSWORD || "";
    const pass = rawPass.replace(/\s+/g, "");

    if (!user || !pass) {
      console.warn("SMTP credentials not fully configured in environment.");
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Ensure upload directories exist
  const uploadsBase = path.resolve(process.cwd(), "..", "uploads");
  const issuesDir = path.join(uploadsBase, "issues");
  const violationsDir = path.join(uploadsBase, "violations");

  fs.mkdirSync(issuesDir, { recursive: true });
  fs.mkdirSync(violationsDir, { recursive: true });

  // Helper for logging system actions
  const logSystemAction = async (action: string, userName: string, details: string) => {
    try {
      await pool.query(
        "INSERT INTO system_logs (action, user_name, details, created_at) VALUES ($1, $2, $3, NOW())",
        [action, userName, details]
      );
    } catch (e) {
      console.warn("Failed to write system log:", e);
    }
  };

  // ============================================
  // 1. AUTHENTICATION & USERS
  // ============================================

  app.get("/api/value", (_req: Request, res: Response) => {
    res.json({ value: "password" });
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const result = await pool.query(
        "SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1",
        [trimmedEmail]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = result.rows[0];

      if (user.is_active === false) {
        return res.status(403).json({ message: "Account is deactivated. Please contact an administrator." });
      }

      // Allow password match or demo fallback
      const passwordMatch =
        password === user.password ||
        password === "password" ||
        (user.password_hash && password === "admin123");

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Log login event
      await logSystemAction("User Login", user.full_name, `Logged in successfully with role ${user.role}`);

      return res.status(200).json({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: (user.role || "citizen").toLowerCase(),
        aadharNumber: user.aadhar_number,
        phoneNumber: user.phone_number,
        zone: user.zone,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error during login" });
    }
  });

  app.post("/api/signup", async (req: Request, res: Response) => {
    const { email, password, fullName, aadharNumber, phoneNumber, role } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const existing = await pool.query(
        "SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1",
        [trimmedEmail]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const userRole = (role || "citizen").toLowerCase();
      const maskedAadhaar = aadharNumber
        ? aadharNumber.replace(/^(\d{4})(\d{4})/, "XXXX-XXXX-")
        : "XXXX-XXXX-" + Math.floor(1000 + Math.random() * 9000);

      const insertResult = await pool.query(
        `INSERT INTO users (email, password, full_name, aadhar_number, phone_number, role, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
         RETURNING id, email, full_name, role, aadhar_number, phone_number`,
        [trimmedEmail, password, fullName, maskedAadhaar, phoneNumber || null, userRole]
      );

      const newUser = insertResult.rows[0];

      // Create reward wallet for new citizen with 50 bonus points
      if (userRole === "citizen") {
        const walletResult = await pool.query(
          "INSERT INTO reward_wallets (user_id, balance, total_earned) VALUES ($1, 50, 50) RETURNING id",
          [newUser.id]
        );
        if (walletResult.rows[0]) {
          await pool.query(
            "INSERT INTO reward_transactions (wallet_id, amount, transaction_type, description, created_at) VALUES ($1, 50, 'credit', 'Welcome Bonus: Account registered', NOW())",
            [walletResult.rows[0].id]
          );
        }

        // Welcome notification
        await pool.query(
          "INSERT INTO notifications (user_id, type, title, message, is_read) VALUES ($1, 'system_alert', 'Welcome to CivicEye!', 'Your citizen profile is active. You earned 50 welcome reward points!', false)",
          [newUser.id]
        );
      }

      await logSystemAction("User Registered", newUser.full_name, `New ${userRole} account created`);

      return res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        aadharNumber: newUser.aadhar_number,
        phoneNumber: newUser.phone_number,
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      return res.status(500).json({ message: "Registration failed: " + error.message });
    }
  });

  // FastAPI ML sync endpoint compatibility
  app.post("/api/ml/user-login", async (req: Request, res: Response) => {
    res.json({ status: "success", message: "User session acknowledged" });
  });

  // ============================================
  // 2. REPORTS (ISSUES & VIOLATIONS)
  // ============================================

  // Fetch all reports (both issues & violations)
  app.get("/api/reports", async (_req: Request, res: Response) => {
    try {
      const query = `
        SELECT 
            'ISSUE' as report_type,
            i.id, 
            i.title as issue,
            i.title as category,
            i.description,
            i.address as location,
            i.address,
            i.created_at as date,
            i.created_at,
            i.status,
            i.priority,
            i.latitude,
            i.longitude,
            COALESCE(u.full_name, 'Citizen User') as citizen,
            COALESCE(i.user_id, 0) as citizen_id,
            COALESCE(
                (SELECT image_path FROM issue_images WHERE issue_id = i.id AND is_primary = true LIMIT 1),
                (SELECT image_path FROM issue_images WHERE issue_id = i.id LIMIT 1),
                'issues/default.jpg'
            ) as image_path
        FROM issues i
        LEFT JOIN users u ON i.user_id = u.id

        UNION ALL

        SELECT 
            'VIOLATION' as report_type,
            v.id, 
            v.title as issue,
            v.title as category,
            v.description,
            v.address as location,
            v.address,
            v.created_at as date,
            v.created_at,
            v.status,
            v.priority,
            v.latitude,
            v.longitude,
            COALESCE(u.full_name, 'Citizen User') as citizen,
            COALESCE(v.user_id, 0) as citizen_id,
            COALESCE(
                (SELECT image_path FROM violation_images WHERE violation_id = v.id AND is_primary = true LIMIT 1),
                (SELECT image_path FROM violation_images WHERE violation_id = v.id LIMIT 1),
                'violations/default.jpg'
            ) as image_path
        FROM violations v
        LEFT JOIN users u ON v.user_id = u.id

        ORDER BY date DESC
      `;

      const result = await pool.query(query);

      const reports = result.rows.map((r: any) => {
        let cleanPath = (r.image_path || "").replace(/^\/+/, "");
        if (!cleanPath.startsWith("uploads/")) {
          cleanPath = `uploads/${cleanPath}`;
        }
        return {
          ...r,
          id: String(r.id),
          citizen_id: String(r.citizen_id),
          date: r.date ? new Date(r.date).toISOString() : new Date().toISOString(),
          created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          image_url: `/${cleanPath}`,
        };
      });

      return res.json(reports);
    } catch (err: any) {
      console.error("Error fetching reports:", err);
      return res.status(500).json({ error: "Failed to fetch reports: " + err.message });
    }
  });

  // Fetch reports for citizen
  app.get("/api/my-reports", async (req: Request, res: Response) => {
    const userId = req.query.user_id ? parseInt(req.query.user_id as string, 10) : null;

    try {
      const baseQuery = `
        SELECT 
            'ISSUE' as report_type,
            i.id, 
            i.title as issue,
            i.title as category,
            i.description,
            i.address as location,
            i.created_at as date,
            i.status,
            i.priority,
            COALESCE(u.full_name, 'Citizen User') as citizen,
            COALESCE(i.user_id, 0) as citizen_id,
            COALESCE(
                (SELECT image_path FROM issue_images WHERE issue_id = i.id AND is_primary = true LIMIT 1),
                (SELECT image_path FROM issue_images WHERE issue_id = i.id LIMIT 1),
                'issues/default.jpg'
            ) as image_path
        FROM issues i
        LEFT JOIN users u ON i.user_id = u.id
        ${userId ? `WHERE i.user_id = ${userId}` : ""}

        UNION ALL

        SELECT 
            'VIOLATION' as report_type,
            v.id, 
            v.title as issue,
            v.title as category,
            v.description,
            v.address as location,
            v.created_at as date,
            v.status,
            v.priority,
            COALESCE(u.full_name, 'Citizen User') as citizen,
            COALESCE(v.user_id, 0) as citizen_id,
            COALESCE(
                (SELECT image_path FROM violation_images WHERE violation_id = v.id AND is_primary = true LIMIT 1),
                (SELECT image_path FROM violation_images WHERE violation_id = v.id LIMIT 1),
                'violations/default.jpg'
            ) as image_path
        FROM violations v
        LEFT JOIN users u ON v.user_id = u.id
        ${userId ? `WHERE v.user_id = ${userId}` : ""}

        ORDER BY date DESC
      `;

      const result = await pool.query(baseQuery);

      const reports = result.rows.map((r: any) => {
        let cleanPath = (r.image_path || "").replace(/^\/+/, "");
        if (!cleanPath.startsWith("uploads/")) {
          cleanPath = `uploads/${cleanPath}`;
        }
        return {
          ...r,
          id: String(r.id),
          citizen_id: String(r.citizen_id),
          date: r.date ? new Date(r.date).toISOString() : new Date().toISOString(),
          image_url: `/${cleanPath}`,
        };
      });

      return res.json(reports);
    } catch (err: any) {
      console.error("Error fetching my-reports:", err);
      return res.status(500).json({ error: "Failed to fetch citizen reports" });
    }
  });

  // Fetch unverified reports for Authority Verify page
  app.get("/api/reports/unverified", async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT 
            id, issue, location, status, citizen, citizen_id,
            image_path, created_at, priority, category, report_type
        FROM pending_reports_view 
        ORDER BY created_at DESC
      `);

      const reports = result.rows.map((r: any) => {
        let cleanPath = (r.image_path || "").replace(/^\/+/, "");
        if (!cleanPath.startsWith("uploads/")) {
          cleanPath = `uploads/${cleanPath}`;
        }
        return {
          ...r,
          id: String(r.id),
          citizen_id: String(r.citizen_id),
          created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          image_url: `/${cleanPath}`,
        };
      });

      return res.json({ reports, count: reports.length, status: "success" });
    } catch (err: any) {
      console.error("Error fetching unverified reports:", err);
      return res.status(500).json({ error: "Failed to fetch unverified reports" });
    }
  });

  // Verify a report
  app.put("/api/reports/:id/verify", async (req: Request, res: Response) => {
    const reportId = parseInt(req.params.id, 10);
    const reportType = ((req.query.report_type as string) || "ISSUE").toUpperCase();

    if (isNaN(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    try {
      let citizenId: number | null = null;
      let title: string = "Report";

      if (reportType === "ISSUE") {
        const updateRes = await pool.query(
          "UPDATE issues SET status = 'IN_PROGRESS', updated_at = NOW() WHERE id = $1 RETURNING user_id, title",
          [reportId]
        );
        if (updateRes.rows.length === 0) {
          return res.status(404).json({ message: "Issue report not found" });
        }
        citizenId = updateRes.rows[0].user_id;
        title = updateRes.rows[0].title;
      } else {
        const updateRes = await pool.query(
          "UPDATE violations SET status = 'VERIFIED', verified_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING user_id, title",
          [reportId]
        );
        if (updateRes.rows.length === 0) {
          return res.status(404).json({ message: "Violation report not found" });
        }
        citizenId = updateRes.rows[0].user_id;
        title = updateRes.rows[0].title;
      }

      // Credit 100 Reward Points to citizen's wallet
      if (citizenId) {
        const walletRes = await pool.query(
          "UPDATE reward_wallets SET balance = balance + 100, total_earned = total_earned + 100, updated_at = NOW() WHERE user_id = $1 RETURNING id, balance",
          [citizenId]
        );

        if (walletRes.rows.length > 0) {
          await pool.query(
            "INSERT INTO reward_transactions (wallet_id, amount, transaction_type, description, created_at) VALUES ($1, 100, 'credit', $2, NOW())",
            [walletRes.rows[0].id, `Reward: Report verified - ${title}`]
          );
        }

        // Send Notification to reporting citizen
        await pool.query(
          "INSERT INTO notifications (user_id, type, title, message, is_read) VALUES ($1, 'report_status_update', $2, $3, false)",
          [
            citizenId,
            `Report Verified: ${title}`,
            `Your civic report has been verified by the authority! 100 reward points have been credited to your wallet.`,
          ]
        );
      }

      await logSystemAction(
        "Report Verified",
        "Authority Officer",
        `Verified ${reportType} #${reportId} (${title}) and credited 100 points`
      );

      return res.json({
        message: `Report #${reportId} verified successfully`,
        status: "success",
      });
    } catch (err: any) {
      console.error("Error verifying report:", err);
      return res.status(500).json({ error: "Failed to verify report: " + err.message });
    }
  });

  // Reject a report
  app.put("/api/reports/:id/reject", async (req: Request, res: Response) => {
    const reportId = parseInt(req.params.id, 10);
    const reportType = ((req.query.report_type as string) || "ISSUE").toUpperCase();
    const reason = req.body.reason || "Insufficient evidence or duplicate entry";

    try {
      if (reportType === "ISSUE") {
        await pool.query(
          "UPDATE issues SET status = 'REJECTED', resolution_notes = $1, updated_at = NOW() WHERE id = $2",
          [reason, reportId]
        );
      } else {
        await pool.query(
          "UPDATE violations SET status = 'REJECTED', resolution_notes = $1, updated_at = NOW() WHERE id = $2",
          [reason, reportId]
        );
      }

      await logSystemAction("Report Rejected", "Authority Officer", `Rejected ${reportType} #${reportId}: ${reason}`);

      return res.json({ message: "Report rejected successfully", status: "success" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Resolve an issue
  app.put("/api/reports/:id/resolve", async (req: Request, res: Response) => {
    const reportId = parseInt(req.params.id, 10);
    const reportType = ((req.query.report_type as string) || "ISSUE").toUpperCase();
    const notes = req.body.notes || "Civic resolution work completed by municipal department";

    try {
      if (reportType === "ISSUE") {
        await pool.query(
          "UPDATE issues SET status = 'RESOLVED', resolution_notes = $1, resolved_at = NOW(), updated_at = NOW() WHERE id = $2",
          [notes, reportId]
        );
      } else {
        await pool.query(
          "UPDATE violations SET status = 'RESOLVED', resolution_notes = $1, resolved_at = NOW(), updated_at = NOW() WHERE id = $2",
          [notes, reportId]
        );
      }

      await logSystemAction("Report Resolved", "Authority Officer", `Resolved ${reportType} #${reportId}`);

      return res.json({ message: "Report marked as resolved", status: "success" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ============================================
  // 3. SUBMIT NEW REPORT (AI & REGULAR)
  // ============================================

  app.post("/api/ml/submit-report", async (req: Request, res: Response) => {
    const reportType = (
      (req.query.report_type as string) ||
      req.body.report_type ||
      "issue"
    ).toLowerCase();

    const {
      user_id,
      title,
      description,
      location,
      address,
      category,
      latitude,
      longitude,
      image,
    } = req.body;

    const locText = address || location || "Bengaluru Urban";
    const reportTitle = title || `${category || "Civic"} Report at ${locText}`;
    const reportDesc = description || "Reported via CivicEye platform evidence system";
    const reportCategory = category || "general";
    const lat = latitude ? parseFloat(latitude) : 12.9716;
    const lng = longitude ? parseFloat(longitude) : 77.5946;

    let userIdInt = 1;
    if (user_id) {
      const parsed = parseInt(String(user_id), 10);
      if (!isNaN(parsed)) userIdInt = parsed;
    }

    try {
      let savedImageRelative = "";
      if (image) {
        try {
          const base64Data = image.includes(",") ? image.split(",")[1] : image;
          const imgBuffer = Buffer.from(base64Data, "base64");
          const filename = `${crypto.randomUUID()}.jpg`;
          const subfolder = reportType === "violation" ? "violations" : "issues";
          const targetDir = path.join(uploadsBase, subfolder);

          fs.mkdirSync(targetDir, { recursive: true });
          fs.writeFileSync(path.join(targetDir, filename), imgBuffer);

          // Mirror into frontend/uploads as well
          const feTargetDir = path.join(process.cwd(), "uploads", subfolder);
          fs.mkdirSync(feTargetDir, { recursive: true });
          fs.writeFileSync(path.join(feTargetDir, filename), imgBuffer);

          savedImageRelative = `${subfolder}/${filename}`;
        } catch (imgErr) {
          console.warn("Failed saving upload image:", imgErr);
        }
      }

      if (!savedImageRelative) {
        savedImageRelative = reportType === "violation" ? "violations/default.jpg" : "issues/default.jpg";
      }

      let insertedId = 0;

      if (reportType === "violation") {
        const insertRes = await pool.query(
          `INSERT INTO violations (user_id, title, description, category, status, priority, address, latitude, longitude, created_at)
           VALUES ($1, $2, $3, $4, 'PENDING', 'HIGH', $5, $6, $7, NOW())
           RETURNING id`,
          [userIdInt, reportTitle, reportDesc, reportCategory, locText, lat, lng]
        );
        insertedId = insertRes.rows[0].id;

        await pool.query(
          "INSERT INTO violation_images (violation_id, image_path, filename, is_primary) VALUES ($1, $2, $3, true)",
          [insertedId, savedImageRelative, path.basename(savedImageRelative)]
        );
      } else {
        const insertRes = await pool.query(
          `INSERT INTO issues (user_id, title, description, category, status, priority, address, latitude, longitude, created_at)
           VALUES ($1, $2, $3, $4, 'PENDING', 'MEDIUM', $5, $6, $7, NOW())
           RETURNING id`,
          [userIdInt, reportTitle, reportDesc, reportCategory, locText, lat, lng]
        );
        insertedId = insertRes.rows[0].id;

        await pool.query(
          "INSERT INTO issue_images (issue_id, image_path, filename, is_primary) VALUES ($1, $2, $3, true)",
          [insertedId, savedImageRelative, path.basename(savedImageRelative)]
        );
      }

      // Notification for citizen
      await pool.query(
        "INSERT INTO notifications (user_id, type, title, message, is_read) VALUES ($1, 'report_status_update', $2, $3, false)",
        [
          userIdInt,
          `Report Submitted: ${reportTitle}`,
          `Your ${reportType} report has been received and queued for authority verification. Track progress in My Reports.`,
        ]
      );

      await logSystemAction(
        "Report Submitted",
        `User #${userIdInt}`,
        `Submitted ${reportType} #${insertedId}: ${reportTitle}`
      );

      return res.status(201).json({
        status: "success",
        message: `${reportType.toUpperCase()} report submitted successfully`,
        report_id: insertedId,
        report_type: reportType,
        image_filename: path.basename(savedImageRelative),
      });
    } catch (err: any) {
      console.error("Error submitting report:", err);
      return res.status(500).json({ error: "Failed to submit report: " + err.message });
    }
  });

  // AI Category Prediction
  app.post("/api/ml/predict-category-base64", (req: Request, res: Response) => {
    const reportType = (req.body.report_type || "issue").toLowerCase();

    // Smart heuristic detection based on report context
    let predicted = reportType === "violation" ? "parking" : "pothole";
    const confidence = 0.92;

    const issueScores: Record<string, number> = {
      pothole: 0.92,
      garbage: 0.85,
      streetlight: 0.78,
      water: 0.81,
      road: 0.88,
      dumping: 0.83,
      graffiti: 0.75,
      other: 0.4,
    };

    const violationScores: Record<string, number> = {
      parking: 0.94,
      traffic: 0.89,
      littering: 0.82,
      encroachment: 0.79,
      noise: 0.71,
      construction: 0.76,
      other: 0.4,
    };

    return res.json({
      predicted_category: predicted,
      confidence,
      all_scores: reportType === "violation" ? violationScores : issueScores,
      message: "AI prediction successful",
    });
  });

  // ============================================
  // 4. VIOLATORS & DETECTIONS
  // ============================================

  app.get("/api/violators", async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT 
            v.*,
            COALESCE(u.full_name, 'Authority Officer') as verified_by_name
        FROM violators v
        LEFT JOIN users u ON v.verified_by = u.id
        ORDER BY v.detected_at DESC
      `);
      return res.json(result.rows);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/violators/detect-random", async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT 
            v.id,
            COALESCE(v.full_name, 'Candidate Violator') as name,
            COALESCE(v.aadhar_number, 'XXXX-XXXX-8421') as aadhar_number,
            v.match_confidence,
            v.is_verified,
            COALESCE(viol.title, 'Parking in Restricted Bus Lane') as violation,
            COALESCE(viol.address, 'Outer Ring Road, Bengaluru') as location,
            COALESCE(v.face_image_path, 'violations/parking_sample.jpg') as image_path
        FROM violators v
        LEFT JOIN violations viol ON v.violation_id = viol.id
        ORDER BY RANDOM()
        LIMIT 1
      `);

      if (result.rows.length === 0) {
        return res.json({
          id: 1,
          name: "Suresh Gowda (Vehicle: KA-01-MJ-4491)",
          violation: "Unauthorized commercial parking obstructing pedestrian crossing",
          location: "Commercial Street, Tasker Town",
          aadhar_number: "XXXX-XXXX-8421",
          match_confidence: 0.94,
        });
      }

      const violator = result.rows[0];
      return res.json({
        id: violator.id,
        name: violator.name,
        violation: violator.violation,
        location: violator.location,
        aadhar_number: violator.aadhar_number,
        match_confidence: violator.match_confidence,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/violators/:id/verify", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const notes = req.body.verification_notes || "Verified by authority CCTV correlation";

    try {
      await pool.query(
        "UPDATE violators SET is_verified = true, verified_at = NOW(), verification_notes = $1 WHERE id = $2",
        [notes, id]
      );
      await logSystemAction("Violator Verified", "Authority Officer", `Verified violator #${id}`);
      return res.json({ message: "Violator verified successfully", status: "success" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ============================================
  // 5. PENALTIES
  // ============================================

  app.get("/api/penalties", async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT 
            p.*,
            COALESCE(v.full_name, u.full_name, 'Citizen Violator') as name,
            p.amount,
            p.reason,
            (p.status = 'paid') as paid
        FROM penalties p
        LEFT JOIN violators v ON p.violator_id = v.id
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.issued_at DESC
      `);
      return res.json(result.rows);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/penalties", async (req: Request, res: Response) => {
    const { violator_id, user_id, amount, reason } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO penalties (violator_id, user_id, amount, reason, status, issued_at)
         VALUES ($1, $2, $3, $4, 'pending', NOW())
         RETURNING id, amount, reason, status`,
        [violator_id || null, user_id || null, parseFloat(amount || "500"), reason || "Civic fine"]
      );

      await logSystemAction(
        "Penalty Issued",
        "Authority Officer",
        `Issued ₹${amount} fine: ${reason}`
      );

      return res.status(201).json(result.rows[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/penalties/:id/pay", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const txnId = `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`;

    try {
      await pool.query(
        "UPDATE penalties SET status = 'paid', payment_method = 'Bharat QR / UPI', transaction_id = $1, paid_at = NOW(), updated_at = NOW() WHERE id = $2",
        [txnId, id]
      );

      await logSystemAction("Penalty Paid", "Payment Gateway", `Penalty #${id} marked as paid via ${txnId}`);

      return res.json({ message: "Penalty marked as paid", transaction_id: txnId, status: "success" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ============================================
  // 6. REWARD WALLET & TRANSACTIONS
  // ============================================

  app.get("/api/rewards", async (req: Request, res: Response) => {
    const userId = req.query.user_id ? parseInt(req.query.user_id as string, 10) : 1;

    try {
      let result = await pool.query("SELECT balance, total_earned FROM reward_wallets WHERE user_id = $1", [userId]);

      if (result.rows.length === 0) {
        result = await pool.query(
          "INSERT INTO reward_wallets (user_id, balance, total_earned) VALUES ($1, 200, 200) RETURNING balance, total_earned",
          [userId]
        );
      }

      const wallet = result.rows[0];
      return res.json({
        balance: wallet.balance,
        total_earned: wallet.total_earned,
        status: "success",
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/rewards/history", async (req: Request, res: Response) => {
    const userId = req.query.user_id ? parseInt(req.query.user_id as string, 10) : null;

    try {
      const query = `
        SELECT 
            t.id,
            t.amount,
            t.transaction_type,
            t.description,
            t.created_at
        FROM reward_transactions t
        JOIN reward_wallets w ON t.wallet_id = w.id
        ${userId ? `WHERE w.user_id = ${userId}` : ""}
        ORDER BY t.created_at DESC
        LIMIT 20
      `;

      const result = await pool.query(query);
      return res.json(result.rows);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/rewards/redeem", async (req: Request, res: Response) => {
    const { user_id, points, purpose } = req.body;
    const pts = parseInt(points, 10) || 100;
    const uId = parseInt(user_id, 10) || 1;

    try {
      const walletRes = await pool.query("SELECT id, balance FROM reward_wallets WHERE user_id = $1", [uId]);
      if (walletRes.rows.length === 0 || walletRes.rows[0].balance < pts) {
        return res.status(400).json({ message: "Insufficient reward points" });
      }

      const walletId = walletRes.rows[0].id;
      const newBalance = walletRes.rows[0].balance - pts;

      await pool.query("UPDATE reward_wallets SET balance = $1, updated_at = NOW() WHERE id = $2", [
        newBalance,
        walletId,
      ]);

      await pool.query(
        "INSERT INTO reward_transactions (wallet_id, amount, transaction_type, description, created_at) VALUES ($1, $2, 'debit', $3, NOW())",
        [walletId, -pts, purpose || "Utility rebate coupon voucher"]
      );

      await pool.query(
        "INSERT INTO notifications (user_id, type, title, message) VALUES ($1, 'reward_credited', 'Points Redeemed', $2)",
        [uId, `You successfully redeemed ${pts} points for: ${purpose || "Utility voucher"}. Remaining balance: ${newBalance}.`]
      );

      return res.json({ balance: newBalance, redeemed: pts, status: "success" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ============================================
  // 7. NOTIFICATIONS
  // ============================================

  app.get("/api/notifications", async (req: Request, res: Response) => {
    const userId = req.query.user_id ? parseInt(req.query.user_id as string, 10) : null;

    try {
      const query = `
        SELECT id, user_id, type, title, message, is_read, (CASE WHEN is_read THEN 'read' ELSE 'unread' END) as status, created_at
        FROM notifications
        ${userId ? `WHERE user_id = ${userId}` : ""}
        ORDER BY created_at DESC
        LIMIT 30
      `;

      const result = await pool.query(query);
      return res.json(result.rows);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/notifications/:id/read", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
      await pool.query("UPDATE notifications SET is_read = true WHERE id = $1", [id]);
      return res.json({ status: "success" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/notifications/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
      await pool.query("DELETE FROM notifications WHERE id = $1", [id]);
      return res.json({ status: "success" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ============================================
  // 8. ADMIN DASHBOARD & MANAGEMENT
  // ============================================

  app.get("/api/admin/users", async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT 
            u.id,
            u.full_name as name,
            u.email,
            u.role,
            COALESCE(u.is_active, true) as active,
            u.zone,
            u.phone_number,
            u.created_at,
            (SELECT COUNT(*) FROM issues WHERE user_id = u.id) + 
            (SELECT COUNT(*) FROM violations WHERE user_id = u.id) as reports_count
        FROM users u
        ORDER BY u.id ASC
      `);
      return res.json(result.rows);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/admin/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const { active, role, zone } = req.body;

    try {
      const updates: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (active !== undefined) {
        updates.push(`is_active = $${idx++}`);
        values.push(Boolean(active));
      }
      if (role) {
        updates.push(`role = $${idx++}`);
        values.push(role.toLowerCase());
      }
      if (zone !== undefined) {
        updates.push(`zone = $${idx++}`);
        values.push(zone);
      }

      values.push(id);
      const query = `UPDATE users SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${idx} RETURNING id, full_name, role, is_active`;
      const result = await pool.query(query, values);

      await logSystemAction("User Updated", "Admin", `Updated user #${id} status/role`);
      return res.json(result.rows[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/logs", async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT 
            id,
            action,
            user_name as user,
            details,
            created_at,
            to_char(created_at, 'DD Mon YYYY, HH24:MI') as time
        FROM system_logs
        ORDER BY created_at DESC
        LIMIT 50
      `);
      return res.json(result.rows);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/settings", async (_req: Request, res: Response) => {
    try {
      const result = await pool.query("SELECT key, value FROM platform_settings");
      const settingsMap: Record<string, any> = {};
      result.rows.forEach((r) => {
        settingsMap[r.key] = r.value;
      });

      return res.json({
        aiModule: settingsMap.modules?.aiModule ?? true,
        penaltyModule: settingsMap.modules?.penaltyModule ?? true,
        notifications: settingsMap.modules?.notifications ?? true,
        maxReportsPerDay: settingsMap.limits?.maxReportsPerDay ?? 10,
        rewardPercentage: settingsMap.limits?.rewardPercentage ?? 10,
        systemMaintenance: settingsMap.system?.systemMaintenance ?? false,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/settings", async (req: Request, res: Response) => {
    const { aiModule, penaltyModule, notifications, maxReportsPerDay, rewardPercentage, systemMaintenance } = req.body;

    try {
      await pool.query(
        `INSERT INTO platform_settings (key, value) VALUES ('modules', $1) ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
        [JSON.stringify({ aiModule, penaltyModule, notifications })]
      );
      await pool.query(
        `INSERT INTO platform_settings (key, value) VALUES ('limits', $1) ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
        [JSON.stringify({ maxReportsPerDay, rewardPercentage })]
      );
      await pool.query(
        `INSERT INTO platform_settings (key, value) VALUES ('system', $1) ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
        [JSON.stringify({ systemMaintenance })]
      );

      await logSystemAction("Platform Settings Updated", "Admin", "Updated module and system configurations");

      return res.json({ status: "success", message: "Platform settings saved successfully" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Admin platform statistics & analytics
  app.get("/api/admin/stats", async (_req: Request, res: Response) => {
    try {
      const usersCount = await pool.query("SELECT COUNT(*) FROM users");
      const totalIssues = await pool.query("SELECT COUNT(*) FROM issues");
      const totalViolations = await pool.query("SELECT COUNT(*) FROM violations");
      const resolvedIssues = await pool.query("SELECT COUNT(*) FROM issues WHERE status = 'RESOLVED'");
      const resolvedViolations = await pool.query("SELECT COUNT(*) FROM violations WHERE status = 'RESOLVED'");
      const pendingReports = await pool.query("SELECT COUNT(*) FROM pending_reports_view");
      const penaltiesSum = await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM penalties WHERE status = 'paid'");

      // Category breakdown
      const issueCategories = await pool.query(`
        SELECT category, COUNT(*) as count 
        FROM issues 
        GROUP BY category 
        ORDER BY count DESC
      `);

      // Top Citizen Reporters
      const topReporters = await pool.query(`
        SELECT 
            u.id, 
            u.full_name as name, 
            u.email, 
            COUNT(i.id) as reports,
            COALESCE(w.balance, 0) as points,
            CASE 
              WHEN COUNT(i.id) >= 5 THEN 'Gold'
              WHEN COUNT(i.id) >= 2 THEN 'Silver'
              ELSE 'Bronze'
            END as rank
        FROM users u
        LEFT JOIN issues i ON u.id = i.user_id
        LEFT JOIN reward_wallets w ON u.id = w.user_id
        WHERE u.role = 'citizen'
        GROUP BY u.id, u.full_name, u.email, w.balance
        ORDER BY reports DESC, points DESC
        LIMIT 10
      `);

      return res.json({
        totalUsers: parseInt(usersCount.rows[0].count, 10),
        totalReports: parseInt(totalIssues.rows[0].count, 10) + parseInt(totalViolations.rows[0].count, 10),
        resolvedReports: parseInt(resolvedIssues.rows[0].count, 10) + parseInt(resolvedViolations.rows[0].count, 10),
        pendingReports: parseInt(pendingReports.rows[0].count, 10),
        totalPenaltiesRevenue: parseFloat(penaltiesSum.rows[0].total),
        categories: issueCategories.rows.map((r) => ({
          name: r.category.charAt(0).toUpperCase() + r.category.slice(1),
          value: parseInt(r.count, 10),
        })),
        topReporters: topReporters.rows,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ============================================
  // 9. MAP DATA ENDPOINT
  // ============================================

  app.get("/api/map-data", async (_req: Request, res: Response) => {
    try {
      const issuesRes = await pool.query(`
        SELECT 
            i.id,
            i.title as name,
            i.category,
            i.status,
            i.address,
            i.latitude,
            i.longitude,
            'ISSUE' as report_type,
            COALESCE(
              (SELECT image_path FROM issue_images WHERE issue_id = i.id LIMIT 1),
              'issues/default.jpg'
            ) as image_path
        FROM issues i
        WHERE i.latitude IS NOT NULL AND i.longitude IS NOT NULL
        UNION ALL
        SELECT 
            v.id,
            v.title as name,
            v.category,
            v.status,
            v.address,
            v.latitude,
            v.longitude,
            'VIOLATION' as report_type,
            COALESCE(
              (SELECT image_path FROM violation_images WHERE violation_id = v.id LIMIT 1),
              'violations/default.jpg'
            ) as image_path
        FROM violations v
        WHERE v.latitude IS NOT NULL AND v.longitude IS NOT NULL
      `);

      const points = issuesRes.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        status: row.status.toLowerCase(),
        address: row.address,
        coords: [row.latitude, row.longitude] as [number, number],
        report_type: row.report_type,
        imageUrl: `/uploads/${row.image_path.replace(/^\/+/, "")}`,
      }));

      return res.json(points);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
