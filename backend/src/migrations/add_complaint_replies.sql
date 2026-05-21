-- PostgreSQL migration: add complaint_replies table
-- Run this only if upgrading an existing database that doesn't have it yet

CREATE TABLE IF NOT EXISTS complaint_replies (
  id           SERIAL PRIMARY KEY,
  complaint_id INT  NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  admin_id     INT  NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  message      TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
