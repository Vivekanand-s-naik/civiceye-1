const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { Pool } = require('pg');

const envPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '.env'),
  path.resolve(process.cwd(), '.env'),
];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  const user = process.env.PGUSER;
  const pass = process.env.PGPASSWORD;
  const host = process.env.PGHOST || 'localhost';
  const port = process.env.PGPORT || '5432';
  const dbName = process.env.PGDATABASE || 'CivicEyeDB';
  if (user && pass) {
    connectionString = `postgresql://${user}:${pass}@${host}:${port}/${dbName}`;
  }
}

if (!connectionString) {
  throw new Error("DATABASE_URL or PostgreSQL credentials (PGUSER, PGPASSWORD) must be set in .env");
}

async function initDB() {
  console.log(`Connecting to database: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
  const pool = new Pool({ connectionString });

  try {
    // 1. Create tables
    await pool.query(`
      -- Users Table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        authority_id VARCHAR(50),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        aadhar_number VARCHAR(50) NOT NULL,
        phone_number VARCHAR(50),
        role VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        zone VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Issues Table
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        priority VARCHAR(50) DEFAULT 'MEDIUM',
        address TEXT NOT NULL,
        latitude FLOAT,
        longitude FLOAT,
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        resolution_notes TEXT,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Issue Images
      CREATE TABLE IF NOT EXISTS issue_images (
        id SERIAL PRIMARY KEY,
        issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
        image_path TEXT NOT NULL,
        filename VARCHAR(255),
        is_primary BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Violations Table
      CREATE TABLE IF NOT EXISTS violations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        priority VARCHAR(50) DEFAULT 'HIGH',
        address TEXT NOT NULL,
        latitude FLOAT,
        longitude FLOAT,
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        resolution_notes TEXT,
        resolved_at TIMESTAMP,
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Violation Images
      CREATE TABLE IF NOT EXISTS violation_images (
        id SERIAL PRIMARY KEY,
        violation_id INTEGER REFERENCES violations(id) ON DELETE CASCADE,
        image_path TEXT NOT NULL,
        filename VARCHAR(255),
        is_primary BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Violators Table
      CREATE TABLE IF NOT EXISTS violators (
        id SERIAL PRIMARY KEY,
        issue_id INTEGER REFERENCES issues(id) ON DELETE SET NULL,
        violation_id INTEGER REFERENCES violations(id) ON DELETE SET NULL,
        aadhar_number VARCHAR(50),
        full_name VARCHAR(255),
        match_confidence FLOAT DEFAULT 0.85,
        face_image_path TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        verification_notes TEXT,
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified_at TIMESTAMP
      );

      -- Penalties Table
      CREATE TABLE IF NOT EXISTS penalties (
        id SERIAL PRIMARY KEY,
        violator_id INTEGER REFERENCES violators(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        amount FLOAT NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(100),
        transaction_id VARCHAR(255),
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Reward Wallets
      CREATE TABLE IF NOT EXISTS reward_wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        balance FLOAT DEFAULT 0.0,
        total_earned FLOAT DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Reward Transactions
      CREATE TABLE IF NOT EXISTS reward_transactions (
        id SERIAL PRIMARY KEY,
        wallet_id INTEGER REFERENCES reward_wallets(id) ON DELETE CASCADE,
        amount FLOAT NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Notifications
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        meta JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- System Logs
      CREATE TABLE IF NOT EXISTS system_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Platform Settings
      CREATE TABLE IF NOT EXISTS platform_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create the unified view for pending reports
    await pool.query(`
      CREATE OR REPLACE VIEW pending_reports_view AS
      SELECT 
          i.id,
          i.title AS issue,
          i.address AS location,
          i.status,
          COALESCE(u.full_name, 'Citizen User') AS citizen,
          i.user_id AS citizen_id,
          COALESCE(
              (SELECT image_path FROM issue_images WHERE issue_id = i.id AND is_primary = true LIMIT 1),
              (SELECT image_path FROM issue_images WHERE issue_id = i.id LIMIT 1)
          ) AS image_path,
          i.created_at,
          i.priority,
          i.category,
          'ISSUE'::text AS report_type
      FROM issues i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.status = 'PENDING'
      UNION ALL
      SELECT 
          v.id,
          v.title AS issue,
          v.address AS location,
          v.status,
          COALESCE(u.full_name, 'Citizen User') AS citizen,
          v.user_id AS citizen_id,
          COALESCE(
              (SELECT image_path FROM violation_images WHERE violation_id = v.id AND is_primary = true LIMIT 1),
              (SELECT image_path FROM violation_images WHERE violation_id = v.id LIMIT 1)
          ) AS image_path,
          v.created_at,
          v.priority,
          v.category,
          'VIOLATION'::text AS report_type
      FROM violations v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.status = 'PENDING';
    `);

    console.log("✅ Tables and Views created successfully.");

    // 3. Seed users if none exist
    const userCount = await pool.query("SELECT COUNT(*) FROM users");
    if (parseInt(userCount.rows[0].count) === 0) {
      console.log("🌱 Seeding initial users...");

      // Insert default users (Admin, Authority, Citizen)
      const insertedUsers = await pool.query(`
        INSERT INTO users (authority_id, email, password, full_name, aadhar_number, phone_number, role, is_active, zone)
        VALUES 
          ('ADM-001', 'admin@civiceye.com', 'admin123', 'System Administrator', 'XXXX-XXXX-1111', '+91-9876543210', 'admin', true, 'Central'),
          ('ADM-002', 'shreeveeraganapati15@gmail.com', 'password', 'Chief Administrator', 'XXXX-XXXX-1111', '+91-9876543211', 'admin', true, 'Central'),
          ('AUTH-001', 'authority@civiceye.com', 'auth123', 'Inspector Rajeev Verma', 'XXXX-XXXX-2222', '+91-9876543220', 'authority', true, 'Indiranagar Zone'),
          ('AUTH-002', 'officer.south@civiceye.com', 'password', 'Officer Asha Patel', 'XXXX-XXXX-2223', '+91-9876543221', 'authority', true, 'South Zone'),
          ('CIT-001', 'citizen@civiceye.com', 'citizen123', 'Aditi Sharma', 'XXXX-XXXX-3333', '+91-9876543230', 'citizen', true, 'Indiranagar'),
          ('CIT-002', 'ravi@civiceye.com', 'password', 'Ravi Kumar', 'XXXX-XXXX-3334', '+91-9876543231', 'citizen', true, 'Koramangala'),
          ('CIT-003', 'priya@civiceye.com', 'password', 'Priya Nambiar', 'XXXX-XXXX-3335', '+91-9876543232', 'citizen', true, 'Whitefield')
        RETURNING id, role, full_name;
      `);

      const adminId = insertedUsers.rows.find(u => u.role === 'admin')?.id;
      const authId = insertedUsers.rows.find(u => u.role === 'authority')?.id;
      const citizen1Id = insertedUsers.rows.find(u => u.role === 'citizen')?.id;
      const citizen2Id = insertedUsers.rows.filter(u => u.role === 'citizen')[1]?.id;

      // Create Reward Wallets
      await pool.query(`
        INSERT INTO reward_wallets (user_id, balance, total_earned)
        VALUES 
          (${citizen1Id}, 450, 750),
          (${citizen2Id}, 200, 300);
      `);

      // Create Reward Transactions
      const walletRes = await pool.query(`SELECT id FROM reward_wallets WHERE user_id = ${citizen1Id}`);
      if (walletRes.rows[0]) {
        const wId = walletRes.rows[0].id;
        await pool.query(`
          INSERT INTO reward_transactions (wallet_id, amount, transaction_type, description, created_at)
          VALUES 
            (${wId}, 100, 'credit', 'Reward: Pothole report on 100ft Road verified by authority', NOW() - INTERVAL '4 days'),
            (${wId}, 150, 'credit', 'Reward: Illegal dumping report verified with penalty issued', NOW() - INTERVAL '3 days'),
            (${wId}, 200, 'credit', 'Reward: Community civic contributor monthly bonus', NOW() - INTERVAL '2 days'),
            (${wId}, -100, 'debit', 'Redeemed: ₹100 BBMP water bill utility voucher', NOW() - INTERVAL '1 day');
        `);
      }

      // Seed Issues with Real File Paths
      const issue1 = await pool.query(`
        INSERT INTO issues (user_id, title, description, category, status, priority, address, latitude, longitude, created_at)
        VALUES (
          ${citizen1Id}, 
          'Hazardous Deep Pothole', 
          'Severe pothole on the inner lane causing two-wheeler skidding and severe traffic slowdown during peak hours.', 
          'pothole', 
          'PENDING', 
          'HIGH', 
          '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, 560038', 
          12.9716, 
          77.6412, 
          NOW() - INTERVAL '2 hours'
        ) RETURNING id;
      `);
      await pool.query(`
        INSERT INTO issue_images (issue_id, image_path, filename, is_primary)
        VALUES (${issue1.rows[0].id}, 'issues/pothole_sample.jpg', 'pothole_sample.jpg', true);
      `);

      const issue2 = await pool.query(`
        INSERT INTO issues (user_id, title, description, category, status, priority, address, latitude, longitude, created_at)
        VALUES (
          ${citizen1Id}, 
          'Overflowing Municipal Waste Dump', 
          'Community garbage bin has been overflowing onto the pavement for 48 hours creating health hazards.', 
          'garbage', 
          'IN_PROGRESS', 
          'MEDIUM', 
          '80 Feet Road, 4th Block, Koramangala, Bengaluru, 560034', 
          12.9345, 
          77.6245, 
          NOW() - INTERVAL '1 day'
        ) RETURNING id;
      `);
      await pool.query(`
        INSERT INTO issue_images (issue_id, image_path, filename, is_primary)
        VALUES (${issue2.rows[0].id}, 'issues/garbage_overflow.jpg', 'garbage_overflow.jpg', true);
      `);

      const issue3 = await pool.query(`
        INSERT INTO issues (user_id, title, description, category, status, priority, address, latitude, longitude, created_at)
        VALUES (
          ${citizen2Id}, 
          'Street Light Outage on Arterial Road', 
          'Series of 3 street lights dysfunctional near school zone, creating unsafe night visibility for pedestrians.', 
          'streetlight', 
          'PENDING', 
          'HIGH', 
          'Whitefield Main Road, near Hope Farm Junction, Bengaluru, 560066', 
          12.9698, 
          77.7499, 
          NOW() - INTERVAL '3 hours'
        ) RETURNING id;
      `);
      await pool.query(`
        INSERT INTO issue_images (issue_id, image_path, filename, is_primary)
        VALUES (${issue3.rows[0].id}, 'issues/broken_street_light.jpg', 'broken_street_light.jpg', true);
      `);

      const issue4 = await pool.query(`
        INSERT INTO issues (user_id, title, description, category, status, priority, address, latitude, longitude, resolved_at, created_at)
        VALUES (
          ${citizen1Id}, 
          'Main Pipeline Water Leakage', 
          'Underground drinking water main cracked with clean water flooding the street.', 
          'water', 
          'RESOLVED', 
          'HIGH', 
          'MG Road, near Trinity Metro Station, Bengaluru, 560001', 
          12.9738, 
          77.6189, 
          NOW() - INTERVAL '5 hours',
          NOW() - INTERVAL '3 days'
        ) RETURNING id;
      `);
      await pool.query(`
        INSERT INTO issue_images (issue_id, image_path, filename, is_primary)
        VALUES (${issue4.rows[0].id}, 'issues/water_leakage.jpg', 'water_leakage.jpg', true);
      `);

      const issue5 = await pool.query(`
        INSERT INTO issues (user_id, title, description, category, status, priority, address, latitude, longitude, created_at)
        VALUES (
          ${citizen2Id}, 
          'Cracked Pavement & Damaged Walkway', 
          'Slabs collapsed on pedestrian sidewalk, risking falls for senior citizens and school children.', 
          'road', 
          'IN_PROGRESS', 
          'LOW', 
          'Brigade Road Commercial Promenade, Bengaluru, 560025', 
          12.9719, 
          77.6070, 
          NOW() - INTERVAL '2 days'
        ) RETURNING id;
      `);
      await pool.query(`
        INSERT INTO issue_images (issue_id, image_path, filename, is_primary)
        VALUES (${issue5.rows[0].id}, 'issues/damaged_footpath.jpg', 'damaged_footpath.jpg', true);
      `);

      // Seed Violations with Real Files
      const viol1 = await pool.query(`
        INSERT INTO violations (user_id, title, description, category, status, priority, address, latitude, longitude, created_at)
        VALUES (
          ${citizen1Id}, 
          'Illegal Commercial Vehicle Parking on Sidewalk', 
          'Heavy delivery lorry parked across yellow tactile paving blocking emergency bus lane.', 
          'parking', 
          'PENDING', 
          'HIGH', 
          'Commercial Street, Tasker Town, Bengaluru, 560001', 
          12.9822, 
          77.6083, 
          NOW() - INTERVAL '4 hours'
        ) RETURNING id;
      `);
      await pool.query(`
        INSERT INTO violation_images (violation_id, image_path, filename, is_primary)
        VALUES (${viol1.rows[0].id}, 'violations/parking_sample.jpg', 'parking_sample.jpg', true);
      `);

      const viol2 = await pool.query(`
        INSERT INTO violations (user_id, title, description, category, status, priority, address, latitude, longitude, verified_at, created_at)
        VALUES (
          ${citizen2Id}, 
          'Dangerous Two-Wheeler Riding Without Helmet', 
          'Motorcycle rider captured speeding through red light without mandatory protective helmet.', 
          'traffic', 
          'VERIFIED', 
          'HIGH', 
          'Outer Ring Road near Bellandur Flyover, Bengaluru, 560103', 
          12.9260, 
          77.6762, 
          NOW() - INTERVAL '1 day',
          NOW() - INTERVAL '2 days'
        ) RETURNING id;
      `);
      await pool.query(`
        INSERT INTO violation_images (violation_id, image_path, filename, is_primary)
        VALUES (${viol2.rows[0].id}, 'violations/no_helmet_sample.jpg', 'no_helmet_sample.jpg', true);
      `);

      // Seed Violators
      const violator1 = await pool.query(`
        INSERT INTO violators (violation_id, aadhar_number, full_name, match_confidence, face_image_path, is_verified, verified_by, verification_notes)
        VALUES (
          ${viol1.rows[0].id},
          'XXXX-XXXX-8421',
          'Suresh Gowda (Vehicle Owner: KA-01-MJ-4491)',
          0.94,
          'violations/parking_sample.jpg',
          false,
          NULL,
          'Automated vehicle registration plate & biometric candidate match'
        ) RETURNING id;
      `);

      const violator2 = await pool.query(`
        INSERT INTO violators (violation_id, aadhar_number, full_name, match_confidence, face_image_path, is_verified, verified_by, verification_notes, verified_at)
        VALUES (
          ${viol2.rows[0].id},
          'XXXX-XXXX-6512',
          'Ramesh Babu (Vehicle: KA-05-EX-8821)',
          0.89,
          'violations/no_helmet_sample.jpg',
          true,
          ${authId},
          'Verified by Officer Rajeev via CCTV junction capture',
          NOW() - INTERVAL '1 day'
        ) RETURNING id;
      `);

      // Seed Penalties
      await pool.query(`
        INSERT INTO penalties (violator_id, user_id, amount, reason, status, payment_method, transaction_id, paid_at)
        VALUES 
          (${violator1.rows[0].id}, ${citizen1Id}, 1000.0, 'Unauthorized commercial parking obstructing pedestrian crossing', 'pending', NULL, NULL, NULL),
          (${violator2.rows[0].id}, ${citizen2Id}, 500.0, 'Section 129 Motor Vehicles Act - Riding without protective helmet', 'paid', 'UPI / Bharat QR', 'TXN-984218751', NOW() - INTERVAL '12 hours'),
          (NULL, ${citizen1Id}, 300.0, 'Public Littering fine at Koramangala', 'pending', NULL, NULL, NULL);
      `);

      // Seed Notifications
      await pool.query(`
        INSERT INTO notifications (user_id, type, title, message, is_read, meta)
        VALUES 
          (${citizen1Id}, 'report_status_update', 'Report Verified: Pothole on 100ft Road', 'Authority Inspector Rajeev has inspected and verified your pothole report. 100 Reward Points credited!', false, '{"issue_id": ${issue1.rows[0].id}}'),
          (${citizen1Id}, 'reward_credited', 'Wallet Credited: +100 Points', 'Your civic wallet balance is now 450 points. Redeem vouchers anytime in your Reward Wallet.', false, '{"amount": 100}'),
          (${citizen1Id}, 'report_status_update', 'Water Pipeline Repaired!', 'The water pipeline leakage at MG Road Metro Station has been successfully resolved by the civic works department.', true, '{"issue_id": ${issue4.rows[0].id}}'),
          (${citizen2Id}, 'penalty_issued', 'Penalty Enforced on Reported Traffic Violation', 'The violator for your traffic report on Outer Ring Road was verified and fined ₹500.', true, '{"violation_id": ${viol2.rows[0].id}}');
      `);

      // Seed System Logs
      await pool.query(`
        INSERT INTO system_logs (action, user_name, details, created_at)
        VALUES 
          ('User Authentication', 'Chief Administrator', 'Admin session established from 127.0.0.1', NOW() - INTERVAL '15 mins'),
          ('Report Verified', 'Inspector Rajeev Verma', 'Verified report #1 with high severity status', NOW() - INTERVAL '1 hour'),
          ('Penalty Processed', 'Inspector Rajeev Verma', 'Issued ₹1,000 fine for vehicle obstruction', NOW() - INTERVAL '3 hours'),
          ('AI Model Prediction', 'Gemini AI Engine', 'Categorized report image as pothole with 94.2% confidence', NOW() - INTERVAL '5 hours'),
          ('Reward Wallet Transaction', 'System Automator', 'Awarded 100 points to Aditi Sharma', NOW() - INTERVAL '6 hours');
      `);

      // Seed Platform Settings
      await pool.query(`
        INSERT INTO platform_settings (key, value)
        VALUES 
          ('modules', '{"aiModule": true, "penaltyModule": true, "notifications": true, "geoFence": true}'),
          ('limits', '{"maxReportsPerDay": 10, "rewardPercentage": 10, "minRedeemPoints": 100}'),
          ('system', '{"systemMaintenance": false, "autoVerifyAIConfidence": 0.95, "version": "2.4.0"}');
      `);

      console.log("🌱 Database seeded successfully with realistic civic data!");
    } else {
      console.log(`ℹ️ Database already contains ${userCount.rows[0].count} users. Preserving existing records.`);
    }

  } catch (err) {
    console.error("❌ Database initialization error:", err);
    throw err;
  } finally {
    await pool.end();
  }
}

initDB().then(() => {
  console.log("🎉 Database ready!");
  process.exit(0);
}).catch(err => {
  console.error("Failed:", err);
  process.exit(1);
});

