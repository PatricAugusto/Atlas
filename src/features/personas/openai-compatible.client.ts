import type { LlmConfig } from "../../config/env.js";
import {
  createPersonaSystemPrompt,
  type Persona,
  type PersonaMessage,
} from "./persona.js";

export interface PersonaChatClient {
  generateReply(
    persona: Persona,
    history: readonly PersonaMessage[],
  ): Promise<string>;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
}

export class OpenAiCompatibleClient implements PersonaChatClient {
  constructor(
    private readonly config: LlmConfig,
    private readonly fetcher: typeof fetch = globalThis.fetch,
  ) {}

  async generateReply(
    persona: Persona,
    history: readonly PersonaMessage[],
  ): Promise<string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.config.apiKey) {
      headers.Authorization = `Bearer ${this.config.apiKey}`;
    }

    const response = await this.fetcher(
      `${this.config.apiBaseUrl}/chat/completions`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: "system",
              content: createPersonaSystemPrompt(persona),
            },
            ...history,
          ],
          temperature: 0.8,
          max_tokens: 220,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `O provedor de IA recusou a solicitação (HTTP ${response.status}). Verifique o modelo, a URL e a chave da API.`,
      );
    }

    let result: ChatCompletionResponse;
    try {
      result = (await response.json()) as ChatCompletionResponse;
    } catch {
      throw new Error("O provedor de IA retornou uma resposta JSON inválida.");
    }

    const content = result.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("O provedor de IA retornou uma resposta vazia ou inválida.");
    }

    return content.trim();
  }
}
