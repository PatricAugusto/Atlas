import { describe, expect, it } from "vitest";
import { loadConfig } from "./env.js";

describe("loadConfig", () => {
  it("returns the Telegram token from the environment", () => {
    expect(loadConfig({ TELEGRAM_BOT_TOKEN: "  test-token  " })).toEqual({
      telegramBotToken: "test-token",
    });
  });

  it.each([undefined, "", "   "])(
    "rejects a missing or blank Telegram token: %s",
    (token) => {
      expect(() => loadConfig({ TELEGRAM_BOT_TOKEN: token })).toThrow(
        "A variável TELEGRAM_BOT_TOKEN é obrigatória.",
      );
    },
  );
});
