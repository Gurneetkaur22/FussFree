const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fussfree_db",
  waitForConnections: true,
  connectionLimit: 10,
});

async function initDB() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  // Create DB if not exists
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || "fussfree_db"}\``);
  await conn.query(`USE \`${process.env.DB_NAME || "fussfree_db"}\``);

  // Create complaints table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      location VARCHAR(255) DEFAULT 'Not provided',
      priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Low',
      status ENUM('Pending', 'Resolved') NOT NULL DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create contacts table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(50) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default complaints if empty
  const [rows] = await conn.query("SELECT COUNT(*) as count FROM complaints");
  if (rows[0].count === 0) {
    await conn.query(`
      INSERT INTO complaints (category, description, location, priority, status, created_at) VALUES
      ('Ragging',        'Ragging incident in college hostel',        '28.6139,77.2090', 'High',   'Pending',  DATE_SUB(NOW(), INTERVAL 5 DAY)),
      ('Harassment',     'Someone harassed me near campus gate',      '28.6129,77.2295', 'High',   'Resolved', DATE_SUB(NOW(), INTERVAL 3 DAY)),
      ('Bullying',       'Verbal bullying in classroom',              '28.7041,77.1025', 'Medium', 'Pending',  DATE_SUB(NOW(), INTERVAL 2 DAY)),
      ('Discrimination', 'Discriminatory behavior by staff',          '28.5355,77.3910', 'Low',    'Resolved', DATE_SUB(NOW(), INTERVAL 7 DAY)),
      ('Ragging',        'Seniors forcing juniors to do tasks',       '28.4595,77.0266', 'High',   'Pending',  DATE_SUB(NOW(), INTERVAL 1 DAY))
    `);
  }

  // Seed default contacts if empty
  const [crows] = await conn.query("SELECT COUNT(*) as count FROM contacts");
  if (crows[0].count === 0) {
    await conn.query(`
      INSERT INTO contacts (name, email, phone) VALUES
      ('Emergency Contact 1', 'emergency1@example.com', '+91 9876543210'),
      ('Campus Security',     'security@campus.edu',    '+91 9876543211')
    `);
  }

  await conn.end();
  console.log("✅ Database & tables ready");
}

module.exports = { pool, initDB };
