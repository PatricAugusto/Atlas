export interface AppConfig {
  telegramBotToken: string;
  llm?: LlmConfig;
}

export interface LlmConfig {
  apiBaseUrl: string;
  apiKey?: string;
  model: string;
}

export function loadConfig(
  env: NodeJS.ProcessEnv = process.env,
): AppConfig {
  const telegramBotToken = env.TELEGRAM_BOT_TOKEN?.trim();

  if (!telegramBotToken) {
    throw new Error("A variável TELEGRAM_BOT_TOKEN é obrigatória.");
  }

  const apiBaseUrl = env.LLM_API_BASE_URL?.trim().replace(/\/+$/, "");
  const apiKey = env.LLM_API_KEY?.trim();
  const model = env.LLM_MODEL?.trim();

  if (apiBaseUrl) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(apiBaseUrl);
    } catch {
      throw new Error(
        "LLM_API_BASE_URL deve ser uma URL HTTP ou HTTPS válida.",
      );
    }

    if (
      !["http:", "https:"].includes(parsedUrl.protocol) ||
      !parsedUrl.hostname
    ) {
      throw new Error(
        "LLM_API_BASE_URL deve ser uma URL HTTP ou HTTPS válida.",
      );
    }
  }

  if (Boolean(apiBaseUrl) !== Boolean(model)) {
    throw new Error(
      "Configure LLM_API_BASE_URL e LLM_MODEL juntos para habilitar as personas.",
    );
  }

  if (apiKey && !apiBaseUrl) {
    throw new Error(
      "LLM_API_KEY requer LLM_API_BASE_URL e LLM_MODEL.",
    );
  }

  return {
    telegramBotToken,
    ...(apiBaseUrl && model
      ? {
          llm: {
            apiBaseUrl,
            ...(apiKey ? { apiKey } : {}),
            model,
          },
        }
      : {}),
  };
}
