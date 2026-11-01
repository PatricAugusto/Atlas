import { describe, expect, it, vi } from "vitest";
import { findPersona } from "./persona.js";
import { OpenAiCompatibleClient } from "./openai-compatible.client.js";

const persona = findPersona("impressora")!;
const config = {
  apiBaseUrl: "https://api.example.com/v1",
  apiKey: "secret-test-key",
  model: "open-model",
};

function response(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    ...init,
    headers: { "Content-Type": "application/json" },
  });
}

describe("OpenAiCompatibleClient", () => {
  it("sends the persona and conversation to the chat completions API", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      response({
        choices: [{ message: { content: "A luz da impressora está acesa." } }],
      }),
    );
    const client = new OpenAiCompatibleClient(config, fetcher);

    await expect(
      client.generateReply(persona, [
        { role: "assistant", content: persona.openingMessage },
        { role: "user", content: "Qual modelo é a impressora?" },
      ]),
    ).resolves.toBe("A luz da impressora está acesa.");

    expect(fetcher).toHaveBeenCalledOnce();
    const [url, options] = fetcher.mock.calls[0];
    expect(url).toBe("https://api.example.com/v1/chat/completions");
    expect(options?.headers).toMatchObject({
      Authorization: "Bearer secret-test-key",
    });
    expect(JSON.parse(String(options?.body))).toMatchObject({
      model: "open-model",
      messages: [
        { role: "system" },
        { role: "assistant", content: persona.openingMessage },
        { role: "user", content: "Qual modelo é a impressora?" },
      ],
      temperature: 0.8,
    });
  });

  it("supports local endpoints that do not require an API key", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      response({ choices: [{ message: { content: "Entendi." } }] }),
    );
    const client = new OpenAiCompatibleClient(
      { apiBaseUrl: "http://localhost:11434/v1", model: "qwen3:8b" },
      fetcher,
    );

    await client.generateReply(persona, []);

    expect(fetcher.mock.calls[0][1]?.headers).not.toHaveProperty("Authorization");
  });

  it("rejects provider errors without exposing response bodies or credentials", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("private provider response", { status: 401 }),
    );
    const client = new OpenAiCompatibleClient(config, fetcher);

    await expect(client.generateReply(persona, [])).rejects.toThrow(
      "HTTP 401",
    );
    await expect(client.generateReply(persona, [])).rejects.not.toThrow(
      "private provider response",
    );
  });

  it("rejects invalid JSON and empty model responses", async () => {
    const invalidJsonClient = new OpenAiCompatibleClient(
      config,
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response("not json", { status: 200 }),
      ),
    );
    await expect(invalidJsonClient.generateReply(persona, [])).rejects.toThrow(
      "JSON inválida",
    );

    const emptyClient = new OpenAiCompatibleClient(
      config,
      vi.fn<typeof fetch>().mockResolvedValue(response({ choices: [] })),
    );
    await expect(emptyClient.generateReply(persona, [])).rejects.toThrow(
      "resposta vazia ou inválida",
    );
  });
});
