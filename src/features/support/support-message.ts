export function createWelcomeMessage(): string {
  return [
    "<b>Olá! Sou o assistente de suporte técnico da Atlas.</b>",
    "",
    "Descreva o problema que você está enfrentando e vamos ajudar.",
    "Para conhecer as simulações de atendimento, envie /personas.",
    "Para ver as opções disponíveis, envie /ajuda.",
  ].join("\n");
}

export function createHelpMessage(): string {
  return [
    "<b>Como posso ajudar?</b>",
    "",
    "Envie uma mensagem descrevendo seu problema técnico.",
    "Para simular um cliente, envie /personas e escolha uma persona com /persona <id>.",
    "Use /start para iniciar novamente.",
  ].join("\n");
}
