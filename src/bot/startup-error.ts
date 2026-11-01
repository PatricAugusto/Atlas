import { GrammyError, HttpError } from "grammy";

export function getStartupErrorMessage(error: unknown): string | undefined {
  if (error instanceof GrammyError) {
    if (error.method === "getMe" && error.error_code === 404) {
      return [
        "O Telegram rejeitou o token do bot durante a inicialização (getMe: 404).",
        "Gere ou copie novamente o token no @BotFather e atualize TELEGRAM_BOT_TOKEN no arquivo .env.",
        "Não compartilhe o token. Após alterá-lo, reinicie o comando de inicialização.",
      ].join("\n");
    }

    return `O Telegram recusou a chamada ${error.method} (código ${error.error_code}). Verifique o token e a configuração do bot.`;
  }

  if (error instanceof HttpError) {
    return "Não foi possível conectar à API do Telegram. Verifique a conexão com a internet e tente novamente.";
  }
}
