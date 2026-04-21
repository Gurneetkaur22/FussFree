const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initDB } = require("./db");
const complaintsRouter = require("./routes/complaints");
const contactsRouter  = require("./routes/contacts");
const sosRouter       = require("./routes/sos");

const app  = express();
const PORT = process.env.PORT || 5000;

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

app.get("/", (req, res) => {
  res.json({
    message: "FussFree API is running!",
    endpoints: {
      health:     "GET  /api/health",
      complaints: "GET  /api/complaints",
      contacts:   "GET  /api/contacts",
      sos:        "POST /api/sos  — sends email alerts via nodemailer",
    },
    frontend: "Open http://localhost:5173 in your browser",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "FussFree backend is running" });
});

app.use("/api/complaints", complaintsRouter);
app.use("/api/contacts",   contactsRouter);
app.use("/api/sos",        sosRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 FussFree backend running at http://localhost:${PORT}`);
      console.log(`📧 SOS emails: configure EMAIL_USER / EMAIL_PASS in backend/.env`);
      console.log(`🌐 Frontend: http://localhost:5173`);
      console.log(`❤️  Health:   http://localhost:${PORT}/api/health\n`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err.message);
    console.error("👉 Check backend/.env — set DB_PASSWORD correctly");
    process.exit(1);
  });
