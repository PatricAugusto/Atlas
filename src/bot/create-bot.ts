import { Bot } from "grammy";
import type { PersonaChatClient } from "../features/personas/openai-compatible.client.js";
import { createPersonasRouter } from "../features/personas/personas.router.js";
import { supportRouter } from "../features/support/support.router.js";

export function createBot(
  token: string,
  personaClient?: PersonaChatClient,
): Bot {
  const bot = new Bot(token);
  bot.use(createPersonasRouter(personaClient));
  bot.use(supportRouter);
  return bot;
}
