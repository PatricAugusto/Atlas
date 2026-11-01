import { describe, expect, it } from "vitest";
import { createBot } from "./create-bot.js";

describe("createBot", () => {
  it("creates a bot with the configured token", () => {
    const bot = createBot("test-token");

    expect(bot.token).toBe("test-token");
  });
});
