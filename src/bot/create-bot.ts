import { Bot } from "grammy";
import { supportRouter } from "../features/support/support.router.js";

export function createBot(token: string): Bot {
  const bot = new Bot(token);
  bot.use(supportRouter);
  return bot;
}
