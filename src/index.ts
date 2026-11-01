import "dotenv/config";
import { createBot } from "./bot/create-bot.js";
import { loadConfig } from "./config/env.js";

const { telegramBotToken } = loadConfig();
const bot = createBot(telegramBotToken);

bot.catch((error) => {
  console.error("Erro ao processar atualização do Telegram:", error);
});

await bot.start();
