const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// PostgreSQL connection pool
const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT || "5432"),
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "fussfree",
});

// Helper: run a query and return { rows, rowCount }
// Drop-in compatibility wrapper so routes call pool.query(sql, params)
// exactly the same as before, but get pg results
// NOTE: routes use [rows] = await pool.query(...) — we keep that destructure
// working by returning an array-like where index 0 = rows array.
const _origQuery = pool.query.bind(pool);

// Wrap pool so routes can continue to do:
//   const [rows] = await pool.query(sql, params)
//   const [result] = await pool.query(INSERT ...)  → result.rows / result.rowCount
// We return [rows] always; for INSERT/UPDATE/DELETE routes check rowCount via rows.
pool.query = async function (sql, params) {
  const res = await _origQuery(sql, params);
  // Return [rows, fields] tuple just like mysql2 — routes do const [rows] = ...
  // For INSERT/UPDATE/DELETE we also attach rowCount & insertId helpers on the rows array
  const rows = res.rows;
  rows.rowCount   = res.rowCount;
  rows.insertId   = rows[0]?.id ?? null;   // pg RETURNING id gives rows[0].id
  rows.affectedRows = res.rowCount;
  return [rows];
};

async function initDB() {
  // Use a direct client (not pool) to create DB if needed
  const { Client } = require("pg");

  // Connect to default "postgres" DB first to create our DB
  const adminClient = new Client({
    host:     process.env.DB_HOST     || "localhost",
    port:     parseInt(process.env.DB_PORT || "5432"),
    user:     process.env.DB_USER     || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: "postgres",
  });

  try {
    await adminClient.connect();
    const dbName = process.env.DB_NAME || "fussfree";
    const { rows } = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1", [dbName]
    );
    if (rows.length === 0) {
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created`);
    }
  } finally {
    await adminClient.end();
  }

  // Now use the pool (connected to fussfree DB) to create tables
  const client = await pool.connect();
  try {
    // ── USERS TABLE ──────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(150) NOT NULL,
        email      VARCHAR(150) NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
        role       VARCHAR(10)  NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
        created_at TIMESTAMPTZ  DEFAULT NOW()
      )
    `);

    // Seed default admin
    const { rows: adminRows } = await client.query(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'admin'"
    );
    if (parseInt(adminRows[0].count) === 0) {
      const hashed = await bcrypt.hash("admin123", 10);
      await client.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'admin')",
        ["Admin", "admin@fussfree.com", hashed]
      );
      console.log("✅ Default admin created: admin@fussfree.com / admin123");
    }

    // ── COMPLAINTS TABLE ─────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id          SERIAL PRIMARY KEY,
        user_id     INT          REFERENCES users(id) ON DELETE SET NULL,
        category    VARCHAR(100) NOT NULL,
        description TEXT         NOT NULL,
        location    VARCHAR(255) DEFAULT 'Not provided',
        priority    VARCHAR(10)  NOT NULL DEFAULT 'Low' CHECK (priority IN ('Low','Medium','High')),
        status      VARCHAR(10)  NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Resolved')),
        created_at  TIMESTAMPTZ  DEFAULT NOW()
      )
    `);

    // ── CONTACTS TABLE ───────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(150) NOT NULL,
        email      VARCHAR(150) NOT NULL,
        phone      VARCHAR(50),
        created_at TIMESTAMPTZ  DEFAULT NOW()
      )
    `);

    // ── CHAT MESSAGES TABLE ──────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id         SERIAL PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL DEFAULT 'anon',
        role       VARCHAR(10)  NOT NULL CHECK (role IN ('user','bot')),
        message    TEXT         NOT NULL,
        created_at TIMESTAMPTZ  DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id)
    `);

    // ── COMPLAINT REPLIES TABLE ──────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaint_replies (
        id           SERIAL PRIMARY KEY,
        complaint_id INT  NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
        admin_id     INT  NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
        message      TEXT NOT NULL,
        created_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ── SEED COMPLAINTS ──────────────────────────────────────────────────────
    const { rows: cRows } = await client.query("SELECT COUNT(*) AS count FROM complaints");
    if (parseInt(cRows[0].count) === 0) {
      await client.query(`
        INSERT INTO complaints (category, description, location, priority, status, created_at) VALUES
        ('Ragging',        'Ragging incident in college hostel',        '28.6139,77.2090', 'High',   'Pending',  NOW() - INTERVAL '5 days'),
        ('Harassment',     'Someone harassed me near campus gate',      '28.6129,77.2295', 'High',   'Resolved', NOW() - INTERVAL '3 days'),
        ('Bullying',       'Verbal bullying in classroom',              '28.7041,77.1025', 'Medium', 'Pending',  NOW() - INTERVAL '2 days'),
        ('Discrimination', 'Discriminatory behavior by staff',          '28.5355,77.3910', 'Low',    'Resolved', NOW() - INTERVAL '7 days'),
        ('Ragging',        'Seniors forcing juniors to do tasks',       '28.4595,77.0266', 'High',   'Pending',  NOW() - INTERVAL '1 day')
      `);
    }

    // ── SEED CONTACTS ────────────────────────────────────────────────────────
    const { rows: ctRows } = await client.query("SELECT COUNT(*) AS count FROM contacts");
    if (parseInt(ctRows[0].count) === 0) {
      await client.query(`
        INSERT INTO contacts (name, email, phone) VALUES
        ('Emergency Contact 1', 'emergency1@example.com', '+91 9876543210'),
        ('Campus Security',     'security@campus.edu',    '+91 9876543211')
      `);
    }

    console.log("✅ Database & tables ready");
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
