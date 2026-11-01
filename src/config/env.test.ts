import { describe, expect, it } from "vitest";
import { loadConfig } from "./env.js";

describe("loadConfig", () => {
  it("returns the Telegram token from the environment", () => {
    expect(loadConfig({ TELEGRAM_BOT_TOKEN: "  test-token  " })).toEqual({
      telegramBotToken: "test-token",
    });
  });

  it("loads an OpenAI-compatible LLM configuration", () => {
    expect(
      loadConfig({
        TELEGRAM_BOT_TOKEN: "test-token",
        LLM_API_BASE_URL: "https://api.example.com/v1/",
        LLM_API_KEY: " test-key ",
        LLM_MODEL: " test-model ",
      }),
    ).toEqual({
      telegramBotToken: "test-token",
      llm: {
        apiBaseUrl: "https://api.example.com/v1",
        apiKey: "test-key",
        model: "test-model",
      },
    });
  });

  it("allows a local LLM endpoint without an API key", () => {
    expect(
      loadConfig({
        TELEGRAM_BOT_TOKEN: "test-token",
        LLM_API_BASE_URL: "http://localhost:11434/v1",
        LLM_MODEL: "qwen3:8b",
      }).llm,
    ).toEqual({
      apiBaseUrl: "http://localhost:11434/v1",
      model: "qwen3:8b",
    });
  });

  it("keeps persona configuration optional", () => {
    expect(loadConfig({ TELEGRAM_BOT_TOKEN: "test-token" }).llm).toBeUndefined();
  });

  it("requires the endpoint and model to be configured together", () => {
    expect(() =>
      loadConfig({
        TELEGRAM_BOT_TOKEN: "test-token",
        LLM_API_BASE_URL: "https://api.example.com/v1",
      }),
    ).toThrow("LLM_API_BASE_URL e LLM_MODEL juntos");
  });

  it("requires an endpoint when an API key is configured", () => {
    expect(() =>
      loadConfig({
        TELEGRAM_BOT_TOKEN: "test-token",
        LLM_API_KEY: "test-key",
      }),
    ).toThrow("LLM_API_KEY requer");
  });

  it("rejects non-HTTP LLM endpoint URLs", () => {
    expect(() =>
      loadConfig({
        TELEGRAM_BOT_TOKEN: "test-token",
        LLM_API_BASE_URL: "ftp://api.example.com",
        LLM_MODEL: "test-model",
      }),
    ).toThrow("LLM_API_BASE_URL deve ser uma URL HTTP ou HTTPS válida.");
  });

  it("rejects malformed LLM endpoint URLs", () => {
    expect(() =>
      loadConfig({
        TELEGRAM_BOT_TOKEN: "test-token",
        LLM_API_BASE_URL: "https://[",
        LLM_MODEL: "test-model",
      }),
    ).toThrow("LLM_API_BASE_URL deve ser uma URL HTTP ou HTTPS válida.");
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
