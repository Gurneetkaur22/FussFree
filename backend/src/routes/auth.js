const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { pool } = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// ─── Register ────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email, and password are required." });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters." });

  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.length > 0)
      return res.status(409).json({ error: "Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'user') RETURNING id",
      [name, email, hashedPassword]
    );
    const newId = result[0].id;

    const token = jwt.sign({ id: newId, name, email, role: "user" }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ message: "Registration successful.", token, user: { id: newId, name, email, role: "user" } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed." });
  }
});

// ─── Login ───────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (rows.length === 0) return res.status(401).json({ error: "Invalid email or password." });

    const user  = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid email or password." });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET, { expiresIn: "7d" }
    );
    res.json({ message: "Login successful.", token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed." });
  }
});

// ─── Admin Login ─────────────────────────────────────────────────────────────
router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND role = 'admin'", [email]
    );
    if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials." });

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials." });

    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email, role: "admin" },
      JWT_SECRET, { expiresIn: "8h" }
    );
    res.json({ message: "Admin login successful.", token, user: { id: admin.id, name: admin.name, email: admin.email, role: "admin" } });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Login failed." });
  }
});

// ─── Me ──────────────────────────────────────────────────────────────────────
router.get("/me", require("../middleware/auth").authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
