function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ok: false,
        error: "Метод не поддерживается.",
      }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const name = String(body.name || "").trim().slice(0, 80);
    const contact = String(body.contact || "").trim().slice(0, 120);
    const message = String(body.message || "").trim().slice(0, 1000);

    if (!name || !contact || !message) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ok: false,
          error: "Заполни все поля.",
        }),
      };
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("Не найдены TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID");

      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ok: false,
          error: "Telegram не настроен на сервере.",
        }),
      };
    }

    const telegramText = [
      "<b>🚀 Новая заявка с сайта</b>",
      "",
      `<b>👤 Имя:</b> ${escapeHtml(name)}`,
      `<b>📞 Контакт:</b> ${escapeHtml(contact)}`,
      "",
      "<b>💬 Сообщение:</b>",
      escapeHtml(message),
    ].join("\n");

    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error("Telegram API error:", result);

      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ok: false,
          error: result.description || "Ошибка Telegram API.",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ok: true,
      }),
    };
  } catch (error) {
    console.error("Function error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ok: false,
        error: "Не удалось отправить заявку.",
      }),
    };
  }
};
