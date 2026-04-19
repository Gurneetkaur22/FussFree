const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// helper: convert MySQL row to frontend shape
function rowToComplaint(r) {
  return {
    id: String(r.id),
    category: r.category,
    description: r.description,
    location: r.location,
    priority: r.priority,
    status: r.status,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  };
}

// GET /api/complaints
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, category, description, location, priority, status, created_at as createdAt FROM complaints ORDER BY created_at DESC"
    );
    res.json(rows.map(rowToComplaint));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/complaints/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, category, description, location, priority, status, created_at as createdAt FROM complaints WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Complaint not found" });
    res.json(rowToComplaint(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/complaints
router.post("/", async (req, res) => {
  const { category, description, location, priority } = req.body;
  if (!category || !description || !priority) {
    return res.status(400).json({ error: "category, description, and priority are required" });
  }
  if (!["Low", "Medium", "High"].includes(priority)) {
    return res.status(400).json({ error: "priority must be Low, Medium, or High" });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO complaints (category, description, location, priority) VALUES (?, ?, ?, ?)",
      [category, description, location || "Not provided", priority]
    );
    const [rows] = await pool.query(
      "SELECT id, category, description, location, priority, status, created_at as createdAt FROM complaints WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json(rowToComplaint(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/complaints/:id/resolve
router.patch("/:id/resolve", async (req, res) => {
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

// DELETE /api/complaints/:id
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM complaints WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Complaint not found" });
    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
