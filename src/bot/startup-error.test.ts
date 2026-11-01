import { describe, expect, it } from "vitest";
import { GrammyError, HttpError } from "grammy";
import { getStartupErrorMessage } from "./startup-error.js";

describe("getStartupErrorMessage", () => {
  it("explains how to resolve a rejected Telegram bot token", () => {
    const error = new GrammyError(
      "getMe failed",
      {
        ok: false,
        error_code: 404,
        description: "Not Found",
      },
      "getMe",
      {},
    );

    expect(getStartupErrorMessage(error)).toContain(
      "atualize TELEGRAM_BOT_TOKEN no arquivo .env",
    );
    expect(getStartupErrorMessage(error)).not.toContain("test-token");
  });

  it("reports other Telegram API errors without exposing request data", () => {
    const error = new GrammyError(
      "sendMessage failed",
      {
        ok: false,
        error_code: 401,
        description: "Unauthorized",
      },
      "sendMessage",
      { chat_id: 123 },
    );

    expect(getStartupErrorMessage(error)).toContain(
      "sendMessage (código 401)",
    );
    expect(getStartupErrorMessage(error)).not.toContain("123");
  });

  it("suggests checking connectivity for HTTP errors", () => {
    expect(getStartupErrorMessage(new HttpError("request failed", new Error()))).toContain(
      "conexão com a internet",
    );
  });

  it("leaves unexpected errors to the caller", () => {
    expect(getStartupErrorMessage(new Error("unexpected"))).toBeUndefined();
  });
});
