const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const { authenticateToken, authenticateAdmin } = require("../middleware/auth");

// helper: convert MySQL row to frontend shape
function rowToComplaint(r) {
  return {
    id: String(r.id),
    userId: r.user_id ? String(r.user_id) : null,
    category: r.category,
    description: r.description,
    location: r.location,
    priority: r.priority,
    status: r.status,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  };
}

// ─── GET /api/complaints ──────────────────────────────────────────────────────
// Admin  → all complaints
// User   → only their own complaints
// (Token required for both)
router.get("/", authenticateToken, async (req, res) => {
  try {
    let rows;
    if (req.user.role === "admin") {
      [rows] = await pool.query(
        "SELECT id, user_id, category, description, location, priority, status, created_at as createdAt FROM complaints ORDER BY created_at DESC"
      );
    } else {
      [rows] = await pool.query(
        "SELECT id, user_id, category, description, location, priority, status, created_at as createdAt FROM complaints WHERE user_id = ? ORDER BY created_at DESC",
        [req.user.id]
      );
    }
    res.json(rows.map(rowToComplaint));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/complaints/:id ──────────────────────────────────────────────────
// Admin → any; User → only their own
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, user_id, category, description, location, priority, status, created_at as createdAt FROM complaints WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Complaint not found" });
    const complaint = rows[0];
    // Users can only view their own
    if (req.user.role !== "admin" && complaint.user_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }
    res.json(rowToComplaint(complaint));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/complaints ─────────────────────────────────────────────────────
// Any authenticated user can submit; complaint is linked to their user_id
router.post("/", authenticateToken, async (req, res) => {
  const { category, description, location, priority } = req.body;
  if (!category || !description || !priority) {
    return res.status(400).json({ error: "category, description, and priority are required" });
  }
  if (!["Low", "Medium", "High"].includes(priority)) {
    return res.status(400).json({ error: "priority must be Low, Medium, or High" });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO complaints (user_id, category, description, location, priority) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, category, description, location || "Not provided", priority]
    );
    const [rows] = await pool.query(
      "SELECT id, user_id, category, description, location, priority, status, created_at as createdAt FROM complaints WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json(rowToComplaint(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/complaints/:id/resolve ───────────────────────────────────────
// Admin only
router.patch("/:id/resolve", authenticateAdmin, async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE complaints SET status = 'Resolved' WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Complaint not found" });
    res.json({ message: "Complaint resolved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/complaints/:id ───────────────────────────────────────────────
// Admin → any; User → only their own pending complaints
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT user_id, status FROM complaints WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Complaint not found" });
    const complaint = rows[0];

    if (req.user.role !== "admin") {
      if (complaint.user_id !== req.user.id) {
        return res.status(403).json({ error: "You can only delete your own complaints." });
      }
      if (complaint.status === "Resolved") {
        return res.status(403).json({ error: "Cannot delete a resolved complaint." });
      }
    }

    await pool.query("DELETE FROM complaints WHERE id = ?", [req.params.id]);
    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/complaints/:id/replies ─────────────────────────────────────────
// Admin → any complaint; User → only their own
router.get("/:id/replies", authenticateToken, async (req, res) => {
  try {
    // Verify access
    const [cRows] = await pool.query("SELECT user_id FROM complaints WHERE id = ?", [req.params.id]);
    if (cRows.length === 0) return res.status(404).json({ error: "Complaint not found" });
    if (req.user.role !== "admin" && cRows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    const [rows] = await pool.query(
      `SELECT cr.id, cr.complaint_id, cr.message,
              cr.created_at as createdAt,
              u.name as adminName
       FROM complaint_replies cr
       LEFT JOIN users u ON u.id = cr.admin_id
       WHERE cr.complaint_id = ?
       ORDER BY cr.created_at ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/complaints/:id/replies ────────────────────────────────────────
// Admin only
router.post("/:id/replies", authenticateAdmin, async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Reply message is required." });
  }
  try {
    const [cRows] = await pool.query("SELECT id FROM complaints WHERE id = ?", [req.params.id]);
    if (cRows.length === 0) return res.status(404).json({ error: "Complaint not found" });

    const [result] = await pool.query(
      "INSERT INTO complaint_replies (complaint_id, admin_id, message) VALUES (?, ?, ?)",
      [req.params.id, req.user.id, message.trim()]
    );
    const [rows] = await pool.query(
      `SELECT cr.id, cr.complaint_id, cr.message,
              cr.created_at as createdAt,
              u.name as adminName
       FROM complaint_replies cr
       LEFT JOIN users u ON u.id = cr.admin_id
       WHERE cr.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/complaints/:id/replies/:replyId ──────────────────────────────
// Admin only
router.delete("/:id/replies/:replyId", authenticateAdmin, async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM complaint_replies WHERE id = ? AND complaint_id = ?",
      [req.params.replyId, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Reply not found" });
    res.json({ message: "Reply deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
