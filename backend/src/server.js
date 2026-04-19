const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initDB } = require("./db");
const complaintsRouter = require("./routes/complaints");
const contactsRouter = require("./routes/contacts");

const app = express();
const PORT = process.env.PORT || 5000;

// Allow all localhost origins (covers 5173, 5174, 127.0.0.1, etc.)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));
app.use(express.json());

// Root — friendly message so opening http://localhost:5000 doesn't confuse
app.get("/", (req, res) => {
  res.json({
    message: "FussFree API is running!",
    endpoints: {
      health:     "GET  /api/health",
      complaints: "GET  /api/complaints",
      contacts:   "GET  /api/contacts",
    },
    frontend: "Open http://localhost:5173 in your browser",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "FussFree backend is running" });
});

// Routes
app.use("/api/complaints", complaintsRouter);
app.use("/api/contacts", contactsRouter);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// Start
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 FussFree backend running at http://localhost:${PORT}`);
      console.log(`🌐 Frontend should be at  http://localhost:5173`);
      console.log(`❤️  Health check:          http://localhost:${PORT}/api/health\n`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err.message);
    console.error("👉 Check your backend/.env — set DB_PASSWORD correctly");
    process.exit(1);
  });
