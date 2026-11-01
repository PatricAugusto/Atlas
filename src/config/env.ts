export interface AppConfig {
  telegramBotToken: string;
}

export function loadConfig(
  env: NodeJS.ProcessEnv = process.env,
): AppConfig {
  const telegramBotToken = env.TELEGRAM_BOT_TOKEN?.trim();

  if (!telegramBotToken) {
    throw new Error("A variável TELEGRAM_BOT_TOKEN é obrigatória.");
  }

  return { telegramBotToken };
}
