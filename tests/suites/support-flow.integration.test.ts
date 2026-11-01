import { describe, expect, it, vi } from "vitest";
import { createBot } from "../../src/bot/create-bot.js";
import type { PersonaChatClient } from "../../src/features/personas/openai-compatible.client.js";

describe("support command integration", () => {
  it("routes /ajuda to the support help response", async () => {
    const bot = createBot("test-token");
    const sentMessages: Array<{ text: unknown; parseMode: unknown }> = [];

    bot.botInfo = {
      id: 1,
      is_bot: true,
      first_name: "Atlas",
      username: "atlas_test_bot",
      can_join_groups: false,
      can_read_all_group_messages: false,
      supports_inline_queries: false,
      can_connect_to_business: false,
      has_main_web_app: false,
      has_topics_enabled: false,
      allows_users_to_create_topics: false,
      can_manage_bots: false,
      supports_join_request_queries: false,
    };
    bot.api.config.use(async (_previous, method, payload) => {
      if (method === "sendMessage") {
        const request = JSON.parse(JSON.stringify(payload)) as Record<
          string,
          unknown
        >;
        sentMessages.push({
          text: request.text,
          parseMode: request.parse_mode,
        });
      }

      return {
        ok: true,
        result: {
          message_id: 1,
          date: 1,
          chat: { id: 123, type: "private", first_name: "Test" },
        },
      } as never;
    });

    await bot.handleUpdate({
      update_id: 1,
      message: {
        message_id: 1,
        date: 1,
        chat: { id: 123, type: "private", first_name: "Test" },
        from: { id: 456, is_bot: false, first_name: "Test" },
        text: "/ajuda",
        entities: [{ offset: 0, length: 6, type: "bot_command" }],
      },
    });

    expect(sentMessages).toHaveLength(1);
    expect(sentMessages[0].text).toContain("Como posso ajudar?");
    expect(sentMessages[0].parseMode).toBe("HTML");
  });

  it("composes persona commands and customer replies in the Telegram bot", async () => {
    const generateReply = vi
      .fn<PersonaChatClient["generateReply"]>()
      .mockResolvedValue("Aparece uma luz laranja piscando.");
    const bot = createBot("test-token", { generateReply });
    const sentMessages: string[] = [];

    bot.botInfo = {
      id: 1,
      is_bot: true,
      first_name: "Atlas",
      username: "atlas_test_bot",
      can_join_groups: false,
      can_read_all_group_messages: false,
      supports_inline_queries: false,
      can_connect_to_business: false,
      has_main_web_app: false,
      has_topics_enabled: false,
      allows_users_to_create_topics: false,
      can_manage_bots: false,
      supports_join_request_queries: false,
    };
    bot.api.config.use(async (_previous, method, payload) => {
      if (method === "sendMessage") {
        const request = JSON.parse(JSON.stringify(payload)) as {
          text?: string;
        };
        if (request.text) sentMessages.push(request.text);
      }

      return {
        ok: true,
        result: {
          message_id: sentMessages.length,
          date: 1,
          chat: { id: 123, type: "private", first_name: "Test" },
        },
      } as never;
    });

    await bot.handleUpdate({
      update_id: 1,
      message: {
        message_id: 1,
        date: 1,
        chat: { id: 123, type: "private", first_name: "Test" },
        from: { id: 456, is_bot: false, first_name: "Test" },
        text: "/persona impressora",
        entities: [{ offset: 0, length: 8, type: "bot_command" }],
      },
    });
    await bot.handleUpdate({
      update_id: 2,
      message: {
        message_id: 2,
        date: 1,
        chat: { id: 123, type: "private", first_name: "Test" },
        from: { id: 456, is_bot: false, first_name: "Test" },
        text: "Ela mostra uma luz piscando.",
      },
    });

    expect(sentMessages[0]).toContain("Simulação iniciada: Mariana");
    expect(sentMessages[1]).toBe("Aparece uma luz laranja piscando.");
    expect(generateReply).toHaveBeenCalledOnce();
  });
});
