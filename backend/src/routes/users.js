const express = require("express");
const router  = express.Router();
const { pool } = require("../db");
const { authenticateAdmin } = require("../middleware/auth");

// GET /api/users
router.get("/", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/users/:id/role
router.patch("/:id/role", authenticateAdmin, async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role))
    return res.status(400).json({ error: "role must be 'user' or 'admin'" });
  if (String(req.params.id) === String(req.user.id) && role !== "admin")
    return res.status(400).json({ error: "You cannot remove your own admin role." });

  try {
    const [rows] = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id",
      [role, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: `User role updated to ${role}` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/users/:id
router.delete("/:id", authenticateAdmin, async (req, res) => {
  if (String(req.params.id) === String(req.user.id))
    return res.status(400).json({ error: "You cannot delete your own account." });

  try {
    const [rows] = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
