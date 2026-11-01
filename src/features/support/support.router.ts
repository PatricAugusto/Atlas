import { Composer } from "grammy";
import {
  createHelpMessage,
  createWelcomeMessage,
} from "./support-message.js";

export const supportRouter = new Composer();

supportRouter.command("start", async (ctx) => {
  await ctx.reply(createWelcomeMessage(), { parse_mode: "HTML" });
});

supportRouter.command("ajuda", async (ctx) => {
  await ctx.reply(createHelpMessage(), { parse_mode: "HTML" });
});
