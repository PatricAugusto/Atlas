import { Bot } from "grammy";
import { describe, expect, it, vi } from "vitest";
import { findPersona, type PersonaMessage } from "./persona.js";
import { PersonaSessionStore } from "./persona-session.store.js";
import {
  createPersonasRouter,
} from "./personas.router.js";
import type { PersonaChatClient } from "./openai-compatible.client.js";

const botInfo = {
  id: 1,
  is_bot: true as const,
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

async function setupBot(
  client?: PersonaChatClient,
  sessions = new PersonaSessionStore(),
) {
  const bot = new Bot("test-token", { botInfo });
  const replies: string[] = [];

  bot.api.config.use(async (_previous, method, payload) => {
    if (method === "sendMessage") {
      const request = JSON.parse(JSON.stringify(payload)) as {
        text?: string;
      };
      if (request.text) replies.push(request.text);
    }
    return {
      ok: true,
      result: {
        message_id: replies.length,
        date: 1,
        chat: { id: 123, type: "private", first_name: "Tester" },
      },
    } as never;
  });
  bot.use(createPersonasRouter(client, sessions));

  return { bot, replies };
}

async function sendText(bot: Bot, text: string, updateId: number) {
  const command = text.split(/\s+/)[0];
  await bot.handleUpdate({
    update_id: updateId,
    message: {
      message_id: updateId,
      date: 1,
      chat: { id: 123, type: "private", first_name: "Tester" },
      from: { id: 456, is_bot: false, first_name: "Tester" },
      text,
      ...(text.startsWith("/")
        ? {
            entities: [
              { offset: 0, length: command.length, type: "bot_command" as const },
            ],
          }
        : {}),
    },
  });
}

describe("createPersonasRouter", () => {
  it("lists available personas without requiring an LLM", async () => {
    const { bot, replies } = await setupBot();

    await sendText(bot, "/personas", 1);

    expect(replies[0]).toContain("impressora");
    expect(replies[0]).toContain("/persona <id>");
  });

  it("starts a persona and sends replies while preserving conversation context", async () => {
    const generateReply = vi
      .fn<
        PersonaChatClient["generateReply"]
      >()
      .mockResolvedValue("Apareceu uma mensagem de erro na tela.");
    const sessions = new PersonaSessionStore();
    const { bot, replies } = await setupBot({ generateReply }, sessions);

    await sendText(bot, "/persona impressora", 1);
    await sendText(bot, "Aparece que está offline.", 2);

    expect(replies[0]).toContain("Simulação iniciada: Mariana");
    expect(replies[0]).toContain("impressora aparece como offline");
    expect(replies[1]).toBe("Apareceu uma mensagem de erro na tela.");
    expect(generateReply).toHaveBeenCalledWith(
      findPersona("impressora"),
      [
        {
          role: "assistant",
          content: findPersona("impressora")!.openingMessage,
        },
        { role: "user", content: "Aparece que está offline." },
      ] satisfies PersonaMessage[],
    );
    expect(sessions.get(123)?.history.at(-1)).toEqual({
      role: "assistant",
      content: "Apareceu uma mensagem de erro na tela.",
    });
  });

  it("explains how to enable simulations when no provider is configured", async () => {
    const { bot, replies } = await setupBot();

    await sendText(bot, "/persona email", 1);

    expect(replies[0]).toContain("LLM_API_BASE_URL e LLM_MODEL");
  });

  it("reports unknown personas and allows ending a simulation", async () => {
    const { bot, replies } = await setupBot({
      generateReply: vi.fn().mockResolvedValue("Certo."),
    });

    await sendText(bot, "/persona desconhecida", 1);
    await sendText(bot, "/persona email", 2);
    await sendText(bot, "/encerrar", 3);

    expect(replies[0]).toContain("Não encontrei essa persona.");
    expect(replies[1]).toContain("Simulação iniciada: João");
    expect(replies[2]).toContain("Simulação encerrada.");
  });

  it("reports provider errors without ending the active simulation", async () => {
    const providerError = new Error("HTTP 429");
    const onError = vi.fn();
    const sessions = new PersonaSessionStore();
    const bot = new Bot("test-token", { botInfo });
    const replies: string[] = [];
    bot.api.config.use(async (_previous, method, payload) => {
      if (method === "sendMessage") {
        const request = JSON.parse(JSON.stringify(payload)) as {
          text?: string;
        };
        if (request.text) replies.push(request.text);
      }
      return {
        ok: true,
        result: {
          message_id: replies.length,
          date: 1,
          chat: { id: 123, type: "private", first_name: "Tester" },
        },
      } as never;
    });
    bot.use(
      createPersonasRouter(
        { generateReply: vi.fn().mockRejectedValue(providerError) },
        sessions,
        onError,
      ),
    );

    await sendText(bot, "/persona acesso", 1);
    await sendText(bot, "Não recebi o código.", 2);

    expect(replies.at(-1)).toContain("Verifique a configuração");
    expect(onError).toHaveBeenCalledWith(providerError, findPersona("acesso"));
    expect(sessions.get(123)?.persona.id).toBe("acesso");
    expect(sessions.get(123)?.history).toHaveLength(1);
  });
});
