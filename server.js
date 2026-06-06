const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.static("public"));
app.use(express.json());

const CHAT_FILE = "./chats/default.json";

// Load history
app.get("/history", (req, res) => {
  try {
    const data = fs.readFileSync(CHAT_FILE, "utf8");
    res.json(JSON.parse(data));
  } catch {
    res.json([]);
  }
});

// Chat API
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    let history = [];

    try {
      history = JSON.parse(
        fs.readFileSync(CHAT_FILE, "utf8")
      );
    } catch {}

    const recentHistory = history
      .slice(-10)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join("\n");

    const fullPrompt = `
You are Chatty AI, a helpful AI assistant.

Previous Conversation:

${recentHistory}

User: ${userMessage}

AI:
`;

    const response = await fetch(
      "http://localhost:11434/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemma3:1b",
          prompt: fullPrompt,
          stream: false,
        }),
      }
    );

    const data = await response.json();

    history.push({
      role: "user",
      content: userMessage,
    });

    history.push({
      role: "ai",
      content: data.response,
    });

    fs.writeFileSync(
      CHAT_FILE,
      JSON.stringify(history, null, 2)
    );

    res.json({
      reply: data.response,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      reply: "Error connecting to AI",
    });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});