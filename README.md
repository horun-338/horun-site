# Сайт Хоруна

Персональный сайт с формой заявки → уведомление в Telegram.

## Запуск

1. Установи [Node.js](https://nodejs.org/)
2. Скопируй `.env.example` в `.env` и заполни:
   - `TELEGRAM_BOT_TOKEN` — токен от @BotFather
   - `TELEGRAM_CHAT_ID` — твой chat id
3. Установи зависимости и запусти:

```bash
npm install
npm start
```

Открой http://localhost:3000

## Важно

Файл `.env` с секретами **не** загружается в GitHub.
