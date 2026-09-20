require("dotenv").config();
const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "16kb" }));
app.use(express.static(path.join(__dirname, "public")));

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Слишком много заявок. Попробуй позже." },
});

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || token.includes("ABC-DEF") || chatId === "123456789") {
    throw new Error("Telegram не настроен. Заполни TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в файле .env");
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.description || "Ошибка Telegram API");
  }
  return data;
}

app.post("/api/request", formLimiter, async (req, res) => {
  try {
    const { name, contact, message } = req.body || {};

    const cleanName = String(name || "").trim().slice(0, 80);
    const cleanContact = String(contact || "").trim().slice(0, 120);
    const cleanMessage = String(message || "").trim().slice(0, 1000);

    if (!cleanName || !cleanContact || !cleanMessage) {
      return res.status(400).json({ ok: false, error: "Заполни все поля." });
    }

    const text = [
      "<b>Новая заявка с сайта</b>",
      "",
      `<b>Имя:</b> ${escapeHtml(cleanName)}`,
      `<b>Контакт:</b> ${escapeHtml(cleanContact)}`,
      `<b>Сообщение:</b>`,
      escapeHtml(cleanMessage),
    ].join("\n");

    await sendTelegramMessage(text);
    return res.json({ ok: true });
  } catch (error) {
    console.error("Request error:", error.message);
    return res.status(500).json({
      ok: false,
      error: error.message || "Не удалось отправить заявку.",
    });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Сайт запущен: http://localhost:${PORT}`);
});
