-- ─────────────────────────────────────────────────────────────
-- Migration: Admin Replies on Complaints
-- Run this once against your MySQL database
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS complaint_replies (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  admin_id    INT NOT NULL,
  message     TEXT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);
