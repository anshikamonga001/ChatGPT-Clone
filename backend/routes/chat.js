import express from "express";
import "dotenv/config";
import Thread from "../models/Thread.js";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ================= CREATE THREAD ================= */
router.post("/thread", async (req, res) => {
  try {
    console.log("THREAD BODY:", req.body);

    const threadId = req.body && req.body.threadId;
    const title = req.body && req.body.title;

    if (!threadId) {
      return res.status(400).json({ error: "threadId missing" });
    }

    let thread = await Thread.findOne({ threadId });
    if (thread) return res.json(thread);

    thread = new Thread({
      threadId,
      title: title || "New Chat",
      messages: [],
    });

    await thread.save();
    res.status(201).json(thread);

  } catch (err) {
    console.error("Create thread error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= SEND MESSAGE ================= */
router.post("/message", async (req, res) => {
  try {
    const threadId = req.body && req.body.threadId;
    const message = req.body && req.body.message;

    if (!threadId || !message) {
      return res.status(400).json({ error: "threadId or message missing" });
    }

    const thread = await Thread.findOne({ threadId });
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    // save user message
    thread.messages.push({
      role: "user",
      content: message,
    });

    // ⚠️ IMPORTANT FIX: send ONLY role + content to Groq
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: thread.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const aiReply = completion.choices[0].message.content;

    // save assistant reply
    thread.messages.push({
      role: "assistant",
      content: aiReply,
    });

    await thread.save();

    res.json({
      reply: aiReply,
      messages: thread.messages,
    });

  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
