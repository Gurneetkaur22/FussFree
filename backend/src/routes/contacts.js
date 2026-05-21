const express = require("express");
const router  = express.Router();
const { pool } = require("../db");
const { authenticateToken, authenticateAdmin } = require("../middleware/auth");

function rowToContact(r) {
  return { id: String(r.id), name: r.name, email: r.email, phone: r.phone || undefined };
}

// GET /api/contacts
router.get("/", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email, phone FROM contacts ORDER BY created_at ASC");
    res.json(rows.map(rowToContact));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/contacts/:id
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email, phone FROM contacts WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Contact not found" });
    res.json(rowToContact(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/contacts
router.post("/", authenticateToken, async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) return res.status(400).json({ error: "name and email are required" });
  try {
    const [result] = await pool.query(
      "INSERT INTO contacts (name, email, phone) VALUES ($1, $2, $3) RETURNING id",
      [name, email, phone || null]
    );
    const newId = result[0].id;
    const [rows] = await pool.query("SELECT id, name, email, phone FROM contacts WHERE id = $1", [newId]);
    res.status(201).json(rowToContact(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/contacts/:id
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query("DELETE FROM contacts WHERE id = $1 RETURNING id", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Contact not found" });
    res.json({ message: "Contact deleted successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
