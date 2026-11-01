import "dotenv/config";
import { createBot } from "./bot/create-bot.js";
import { getStartupErrorMessage } from "./bot/startup-error.js";
import { loadConfig } from "./config/env.js";

const { telegramBotToken } = loadConfig();
const bot = createBot(telegramBotToken);

bot.catch((error) => {
  console.error("Erro ao processar atualização do Telegram:", error);
});

try {
  await bot.start({
    onStart: ({ username }) => {
      console.info(`Bot Atlas iniciado como @${username}.`);
    },
  });
} catch (error) {
  const message = getStartupErrorMessage(error);

  if (!message) {
    throw error;
  }

  console.error(message);
  process.exitCode = 1;
}
