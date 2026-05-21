const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { pool } = require("../db");

// Build transporter only when email creds are configured
function makeTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (
    !user || !pass ||
    user === "your_gmail@gmail.com" ||
    pass === "your_16_char_app_password"
  ) {
    return null; // email not configured — SOS still logs and responds
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

// POST /api/sos
// Body: { senderName, location, contacts: [{name, email, phone}] }
router.post("/", async (req, res) => {
  const { senderName, location, contacts } = req.body;

  if (!contacts || contacts.length === 0) {
    return res.status(400).json({ error: "No contacts provided" });
  }

  const mapsLink =
    location && location !== "Location unavailable"
      ? `https://maps.google.com/?q=${location}`
      : null;

  const transporter = makeTransporter();
  const results = [];

  for (const contact of contacts) {
    if (!contact.email) {
      results.push({ name: contact.name, status: "skipped", reason: "no email" });
      continue;
    }

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: contact.email,
          subject: `🚨 EMERGENCY SOS from ${senderName || "a FussFree user"}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;
                        border:2px solid #dc2626;border-radius:10px;overflow:hidden;">
              <div style="background:#dc2626;padding:20px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:22px;">🚨 EMERGENCY SOS ALERT</h1>
              </div>
              <div style="padding:24px;">
                <p style="font-size:17px;font-weight:bold;color:#dc2626;margin-top:0;">
                  ${senderName || "Someone"} needs immediate help!
                </p>
                <table style="width:100%;border-collapse:collapse;margin:12px 0;">
                  <tr>
                    <td style="padding:8px 10px;background:#fef2f2;font-weight:bold;
                               border:1px solid #fecaca;width:100px;">From</td>
                    <td style="padding:8px 10px;border:1px solid #fecaca;">
                      ${senderName || "Unknown"}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 10px;background:#fef2f2;font-weight:bold;
                               border:1px solid #fecaca;">Time</td>
                    <td style="padding:8px 10px;border:1px solid #fecaca;">
                      ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 10px;background:#fef2f2;font-weight:bold;
                               border:1px solid #fecaca;">Location</td>
                    <td style="padding:8px 10px;border:1px solid #fecaca;">
                      ${location || "Not available"}
                      ${mapsLink ? `<br/><a href="${mapsLink}" style="color:#2563eb;">
                        View on Google Maps →</a>` : ""}
                    </td>
                  </tr>
                </table>
                <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;
                            padding:12px;margin-top:8px;">
                  <strong style="color:#dc2626;">
                    ⚠️ Please respond immediately or contact emergency services (Police: 100).
                  </strong>
                </div>
                <p style="font-size:11px;color:#9ca3af;margin-top:16px;">
                  Sent automatically by FussFree Campus Safety System.
                </p>
              </div>
            </div>
          `,
        });
        results.push({ name: contact.name, email: contact.email, status: "sent" });
      } catch (err) {
        results.push({ name: contact.name, email: contact.email, status: "failed", error: err.message });
      }
    } else {
      // Email not configured — just log (SOS still "works" visually)
      console.log(`[SOS] Alert for ${contact.name} <${contact.email}> — location: ${location}`);
      results.push({ name: contact.name, email: contact.email, status: "logged_no_email_config" });
    }
  }

  const sent = results.filter((r) => r.status === "sent").length;

  res.json({
    success: true,
    emailConfigured: !!transporter,
    emailsSent: sent,
    results,
    message: transporter
      ? `SOS email sent to ${sent} of ${contacts.length} contact(s)`
      : "SOS recorded. Add EMAIL_USER & EMAIL_PASS in backend/.env to enable real emails.",
  });
});

module.exports = router;
