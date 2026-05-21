const express = require("express");
const router  = express.Router();
const { pool } = require("../db");
const { authenticateToken, authenticateAdmin } = require("../middleware/auth");

function rowToComplaint(r) {
  return {
    id:          String(r.id),
    userId:      r.user_id ? String(r.user_id) : null,
    category:    r.category,
    description: r.description,
    location:    r.location,
    priority:    r.priority,
    status:      r.status,
    createdAt:   r.createdat instanceof Date ? r.createdat.toISOString() : r.createdat,
  };
}

// GET /api/complaints
router.get("/", authenticateToken, async (req, res) => {
  try {
    let rows;
    if (req.user.role === "admin") {
      [rows] = await pool.query(
        "SELECT id, user_id, category, description, location, priority, status, created_at AS createdAt FROM complaints ORDER BY created_at DESC"
      );
    } else {
      [rows] = await pool.query(
        "SELECT id, user_id, category, description, location, priority, status, created_at AS createdAt FROM complaints WHERE user_id = $1 ORDER BY created_at DESC",
        [req.user.id]
      );
    }
    res.json(rows.map(rowToComplaint));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/complaints/:id
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, user_id, category, description, location, priority, status, created_at AS createdAt FROM complaints WHERE id = $1",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Complaint not found" });
    const c = rows[0];
    if (req.user.role !== "admin" && c.user_id !== req.user.id)
      return res.status(403).json({ error: "Access denied." });
    res.json(rowToComplaint(c));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/complaints
router.post("/", authenticateToken, async (req, res) => {
  const { category, description, location, priority } = req.body;
  if (!category || !description || !priority)
    return res.status(400).json({ error: "category, description, and priority are required" });
  if (!["Low", "Medium", "High"].includes(priority))
    return res.status(400).json({ error: "priority must be Low, Medium, or High" });

  try {
    const [result] = await pool.query(
      "INSERT INTO complaints (user_id, category, description, location, priority) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [req.user.id, category, description, location || "Not provided", priority]
    );
    const newId = result[0].id;
    const [rows] = await pool.query(
      "SELECT id, user_id, category, description, location, priority, status, created_at AS createdAt FROM complaints WHERE id = $1",
      [newId]
    );
    res.status(201).json(rowToComplaint(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/complaints/:id/resolve
router.patch("/:id/resolve", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "UPDATE complaints SET status = 'Resolved' WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Complaint not found" });
    res.json({ message: "Complaint resolved successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/complaints/:id
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT user_id, status FROM complaints WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Complaint not found" });
    const c = rows[0];

    if (req.user.role !== "admin") {
      if (c.user_id !== req.user.id)
        return res.status(403).json({ error: "You can only delete your own complaints." });
      if (c.status === "Resolved")
        return res.status(403).json({ error: "Cannot delete a resolved complaint." });
    }

    await pool.query("DELETE FROM complaints WHERE id = $1", [req.params.id]);
    res.json({ message: "Complaint deleted successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/complaints/:id/replies
router.get("/:id/replies", authenticateToken, async (req, res) => {
  try {
    const [cRows] = await pool.query("SELECT user_id FROM complaints WHERE id = $1", [req.params.id]);
    if (cRows.length === 0) return res.status(404).json({ error: "Complaint not found" });
    if (req.user.role !== "admin" && cRows[0].user_id !== req.user.id)
      return res.status(403).json({ error: "Access denied." });

    const [rows] = await pool.query(
      `SELECT cr.id, cr.complaint_id, cr.message,
              cr.created_at AS "createdAt",
              u.name        AS "adminName"
       FROM complaint_replies cr
       LEFT JOIN users u ON u.id = cr.admin_id
       WHERE cr.complaint_id = $1
       ORDER BY cr.created_at ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/complaints/:id/replies
router.post("/:id/replies", authenticateAdmin, async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim())
    return res.status(400).json({ error: "Reply message is required." });

  try {
    const [cRows] = await pool.query("SELECT id FROM complaints WHERE id = $1", [req.params.id]);
    if (cRows.length === 0) return res.status(404).json({ error: "Complaint not found" });

    const [result] = await pool.query(
      "INSERT INTO complaint_replies (complaint_id, admin_id, message) VALUES ($1, $2, $3) RETURNING id",
      [req.params.id, req.user.id, message.trim()]
    );
    const newId = result[0].id;
    const [rows] = await pool.query(
      `SELECT cr.id, cr.complaint_id, cr.message,
              cr.created_at AS "createdAt",
              u.name        AS "adminName"
       FROM complaint_replies cr
       LEFT JOIN users u ON u.id = cr.admin_id
       WHERE cr.id = $1`,
      [newId]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/complaints/:id/replies/:replyId
router.delete("/:id/replies/:replyId", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "DELETE FROM complaint_replies WHERE id = $1 AND complaint_id = $2 RETURNING id",
      [req.params.replyId, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Reply not found" });
    res.json({ message: "Reply deleted." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
