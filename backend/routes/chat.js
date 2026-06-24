import express from "express";
import Thread from "../models/Thread.js";
import Groq from "groq-sdk";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* =====================================================
   1️⃣ GET /thread  → get all threads (latest first)
   ===================================================== */
router.get("/thread", verifyToken, async (req, res) => {
  try {
    let threads = await Thread.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .select("-messages"); // messages hide (list view)

    res.json(threads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch threads" });
  }
});

/* =====================================================
   🔥 DELETE /thread  → delete ALL threads for user
   ===================================================== */
router.delete("/thread", verifyToken, async (req, res) => {
  try {
    await Thread.deleteMany({ userId: req.user.id });
    res.json({ success: "All threads deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete all threads" });
  }
});

/* =====================================================
   2️⃣ GET /thread/:threadId → get messages of a thread
   ===================================================== */
router.get("/thread/:threadId", verifyToken, async (req, res) => {
  const { threadId } = req.params;

  try {
    const thread = await Thread.findOne({ threadId, userId: req.user.id });

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.json(thread.messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

/* =====================================================
   3️⃣ DELETE /thread/:threadId → delete a thread
   ===================================================== */
router.delete("/thread/:threadId", verifyToken, async (req, res) => {
  const { threadId } = req.params;

  try {
    const deleted = await Thread.findOneAndDelete({ threadId, userId: req.user.id });

    if (!deleted) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.json({ success: "Thread deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete thread" });
  }
});

/* =====================================================
   4️⃣ POST /chat → main chat logic
   ===================================================== */
router.post("/chat", verifyToken, async (req, res) => {
  try {
    const { threadId, message } = req.body;

    // 1️⃣ validate
    if (!threadId || !message) {
      return res.status(400).json({ error: "threadId or message missing" });
    }

    // 2️⃣ find thread
    let thread = await Thread.findOne({ threadId, userId: req.user.id });

    // if not exist → create
    if (!thread) {
      thread = new Thread({
        threadId,
        userId: req.user.id,
        title: message.slice(0, 30),
        messages: [],
      });
    }

    // 3️⃣ save user message
    thread.messages.push({
      role: "user",
      content: message,
    });

    // 4️⃣ send to Groq (ONLY role + content)
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: thread.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const assistantReply =
      completion.choices[0]?.message?.content || "No reply";

    // 5️⃣ save assistant reply
    thread.messages.push({
      role: "assistant",
      content: assistantReply,
    });

    thread.updatedAt = new Date();
    await thread.save();

    // 6️⃣ response
    res.json({
      reply: assistantReply,
      messages: thread.messages,
    });

  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
