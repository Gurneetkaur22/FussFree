const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const { authenticateAdmin } = require("../middleware/auth");

// All routes require admin

// GET /api/users — list all users (admin only)
router.get("/", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id/role — change user role (admin only)
router.patch("/:id/role", authenticateAdmin, async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ error: "role must be 'user' or 'admin'" });
  }
  // Prevent self-demotion
  if (String(req.params.id) === String(req.user.id) && role !== "admin") {
    return res.status(400).json({ error: "You cannot remove your own admin role." });
  }
  try {
    const [result] = await pool.query(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: `User role updated to ${role}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id — delete a user (admin only, cannot delete self)
router.delete("/:id", authenticateAdmin, async (req, res) => {
  if (String(req.params.id) === String(req.user.id)) {
    return res.status(400).json({ error: "You cannot delete your own account." });
  }
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
