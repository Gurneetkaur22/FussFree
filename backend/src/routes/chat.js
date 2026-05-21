const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// ─── Knowledge Base ────────────────────────────────────────────────────────────
const knowledgeBase = [
  { patterns: ["sos", "emergency", "help me", "danger", "unsafe", "attack", "threat", "scared", "afraid", "hurt"], response: "🚨 **Emergency detected!** Please use the **SOS button** in the app immediately — it will alert all your emergency contacts.\n\n📞 Campus Security: **+91 9876543211**\n🏥 Emergency Services: **112**\n\nAre you safe right now? Tell me more about what's happening.", category: "emergency" },
  { patterns: ["ragging", "seniors", "forced", "force me", "hostel ragging", "rag", "torture", "torment"], response: "😔 I'm really sorry you're experiencing ragging. **You are not alone, and it is NOT okay.**\n\n**Immediate steps:**\n1. 📝 File a complaint using the **Report Complaint** button\n2. 🚨 Trigger **SOS** if you feel physically threatened\n3. 📞 Contact the Anti-Ragging Helpline: **1800-180-5522** (Free)\n4. 🏫 Report to your college's Anti-Ragging Committee\n\n**Remember:** Ragging is a criminal offense under Indian law. Would you like help filing a complaint?", category: "ragging" },
  { patterns: ["harassment", "harassed", "harassing", "sexual harassment", "inappropriate", "touched", "stalking", "stalked", "following me"], response: "💙 Thank you for sharing this. **Harassment is never your fault.**\n\n**Steps to take right now:**\n1. 📸 **Document everything** — screenshots, dates, witnesses\n2. 📝 **File a complaint** using our complaint form (select 'Harassment')\n3. 👤 Talk to a trusted teacher, counselor, or family member\n4. 📞 Women's Helpline: **1091** | Cybercrime: **1930**\n\nWould you like me to explain how to file a complaint?", category: "harassment" },
  { patterns: ["bullying", "bully", "bullied", "teasing", "mocking", "taunting", "making fun", "name calling", "cyberbullying", "online abuse"], response: "💙 Bullying is a serious issue and you're right to speak up about it.\n\n**How FussFree can help:**\n1. 📝 File a complaint with category 'Bullying' or 'Cyberbullying'\n2. 📷 Save all evidence (screenshots, messages)\n3. 🚫 Block the person on all platforms\n4. 📞 iCall Helpline: **9152987821**\n\nDo you want to know how to file a complaint step-by-step?", category: "bullying" },
  { patterns: ["how to complain", "file complaint", "report", "submit complaint", "register complaint", "how do i report", "complaint form", "raise complaint"], response: "📝 **Here's how to file a complaint on FussFree:**\n\n1. Go to **Dashboard → My Complaints**\n2. Click **'Report Complaint'**\n3. Fill in:\n   - **Category** (Ragging, Harassment, Bullying, etc.)\n   - **Description** of what happened\n   - **Location** (optional — click 📍 to auto-detect)\n4. Click **Submit** — AI will auto-detect the priority\n\n💡 You can also use the **🎤 Voice** button to dictate your complaint.\n\nYour complaint is reviewed by admins and kept **confidential**.", category: "complaint" },
  { patterns: ["status", "my complaint", "complaint status", "check status", "what happened", "resolved", "pending", "update on my"], response: "📊 **To check your complaint status:**\n\nGo to **My Complaints** page in the navigation menu. You'll see:\n- 🟡 **Pending** — Under review by admin\n- ✅ **Resolved** — Action has been taken\n\nAdmins will update the status as they investigate. If your complaint is urgent, please use the **🚨 SOS** button.", category: "complaint" },
  { patterns: ["contact", "contacts", "emergency contact", "who to call", "helpline", "number", "phone", "reach out"], response: "📞 **Emergency Contacts & Helplines:**\n\n🏫 **Campus Security:** +91 9876543211\n📧 **Campus Email:** security@campus.edu\n\n🆘 **National Helplines:**\n- Emergency: **112**\n- Women's Helpline: **1091**\n- Anti-Ragging: **1800-180-5522** (Free)\n- Cybercrime: **1930**\n- iCall (Mental Health): **9152987821**\n- Childline: **1098**", category: "contacts" },
  { patterns: ["depressed", "depression", "anxiety", "mental health", "stressed", "stress", "suicidal", "suicide", "want to die", "hopeless", "alone", "lonely", "crying", "overwhelmed"], response: "💙 I hear you, and I care. What you're feeling is real and it matters.\n\n**You are not alone. Please reach out:**\n\n📞 **iCall (Free counseling):** 9152987821\n📞 **Vandrevala Foundation:** 1860-2662-345 (24/7)\n📞 **AASRA:** 9820466627 (24/7 suicide prevention)\n\nWould you like to talk more? I'm here to listen. 💙", category: "mental_health" },
  { patterns: ["map", "location", "incident location", "where", "plot", "view on map", "see complaints map"], response: "🗺️ **FussFree Incident Map:**\n\nGo to **Map** in the navigation menu to see all reported incident locations on an interactive map.", category: "map" },
  { patterns: ["what is fussfree", "about fussfree", "fussfree", "what does this app do", "what can you do", "features", "how does this work"], response: "🛡️ **Welcome to FussFree!**\n\nFussFree is a **Campus Safety Platform** that helps you:\n\n📝 **Report Complaints** — Ragging, harassment, bullying, discrimination\n🗺️ **Track Incidents** — View complaints on an interactive map\n👥 **Manage Contacts** — Store emergency contacts\n🚨 **SOS Alerts** — Instantly alert your emergency contacts\n\n**I'm your 24/7 AI assistant.**", category: "general" },
  { patterns: ["hi", "hello", "hey", "hii", "good morning", "good evening", "good afternoon", "namaste", "howdy", "what's up", "whats up"], response: "👋 **Hello! I'm FussFree Assistant.**\n\nI'm here to help you with:\n- 🚨 **Emergencies** — SOS guidance\n- 📝 **Filing complaints** — Step-by-step help\n- 📞 **Helplines** — Instant access to support numbers\n- ❓ **Questions** about campus safety\n\nWhat can I help you with today?", category: "greeting" },
  { patterns: ["thanks", "thank you", "thankyou", "bye", "goodbye", "ok bye", "that's all", "thats all", "nothing else"], response: "😊 You're welcome! **Stay safe and remember:**\n\n- 🚨 Use **SOS** for emergencies\n- 📝 **Report** any incident — your voice matters\n- 💙 You're never alone on FussFree\n\nTake care! 👋", category: "general" },
];

function findBestResponse(message) {
  const lower = message.toLowerCase().trim();
  let bestMatch = null, bestScore = 0;
  for (const entry of knowledgeBase) {
    let score = 0;
    for (const pattern of entry.patterns) {
      if (lower.includes(pattern)) score += pattern.length + (lower === pattern ? 10 : 0);
    }
    if (score > bestScore) { bestScore = score; bestMatch = entry; }
  }
  return bestScore > 0 ? bestMatch : null;
}

// POST /api/chat
router.post("/", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || typeof message !== "string") return res.status(400).json({ error: "message is required" });
    const trimmed = message.trim();
    if (!trimmed.length) return res.status(400).json({ error: "message cannot be empty" });
    if (trimmed.length > 1000) return res.status(400).json({ error: "message too long (max 1000 chars)" });

    try {
      await pool.query(
        "INSERT INTO chat_messages (session_id, role, message) VALUES ($1, 'user', $2)",
        [sessionId || "anon", trimmed]
      );
    } catch (_) {}

    const match = findBestResponse(trimmed);
    let botResponse;
    if (match) {
      botResponse = match.response;
    } else {
      const lower = trimmed.toLowerCase();
      botResponse = lower.includes("?")
        ? "🤔 That's a great question! I might not have a specific answer for that.\n\n**Here's what I can help with:**\n- 🚨 Emergency / SOS guidance\n- 📝 How to file a complaint\n- 📞 Helpline numbers\n- 🗺️ Using the Map feature\n\nCould you rephrase or ask about one of these topics?"
        : "💬 I'm not sure I understood that. Here are some things you can ask:\n\n- *\"How do I report ragging?\"*\n- *\"What is the SOS feature?\"*\n- *\"Give me helpline numbers\"*\n- *\"How do I file a complaint?\"*";
    }

    try {
      await pool.query(
        "INSERT INTO chat_messages (session_id, role, message) VALUES ($1, 'bot', $2)",
        [sessionId || "anon", botResponse]
      );
    } catch (_) {}

    res.json({ message: botResponse, category: match?.category || "general", timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat service unavailable." });
  }
});

// GET /api/chat/history/:sessionId
router.get("/history/:sessionId", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT role, message, created_at FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC LIMIT 100",
      [req.params.sessionId]
    );
    res.json(rows);
  } catch (err) { res.json([]); }
});

module.exports = router;
