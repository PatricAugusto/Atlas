import { describe, expect, it } from "vitest";
import {
  createHelpMessage,
  createWelcomeMessage,
} from "./support-message.js";

describe("support messages", () => {
  it("creates a Telegram HTML welcome message", () => {
    expect(createWelcomeMessage()).toContain(
      "<b>Olá! Sou o assistente de suporte técnico da Atlas.</b>",
    );
    expect(createWelcomeMessage()).toContain("/personas");
    expect(createWelcomeMessage()).toContain("/ajuda");
  });

  it("creates help with the supported support flow", () => {
    expect(createHelpMessage()).toContain(
      "Envie uma mensagem descrevendo seu problema técnico.",
    );
    expect(createHelpMessage()).toContain("/persona <id>");
    expect(createHelpMessage()).toContain("/start");
  });
});
