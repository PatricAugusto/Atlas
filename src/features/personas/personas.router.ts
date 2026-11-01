import { Composer } from "grammy";
import { PersonaSessionStore } from "./persona-session.store.js";
import {
  findPersona,
  formatPersonaCatalog,
  type Persona,
} from "./persona.js";
import type { PersonaChatClient } from "./openai-compatible.client.js";

type PersonaErrorHandler = (error: unknown, persona: Persona) => void;

export function createPersonasRouter(
  client?: PersonaChatClient,
  sessions = new PersonaSessionStore(),
  onError: PersonaErrorHandler = (error, persona) => {
    console.error(`Erro ao gerar resposta da persona ${persona.id}:`, error);
  },
) {
  const router = new Composer();

  router.command("personas", async (ctx) => {
    await ctx.reply(formatPersonaCatalog());
  });

  router.command("persona", async (ctx) => {
    const personaId = ctx.match.trim().split(/\s+/)[0]?.toLowerCase();
    const persona = personaId ? findPersona(personaId) : undefined;

    if (!persona) {
      await ctx.reply(
        `Não encontrei essa persona.\n\n${formatPersonaCatalog()}`,
      );
      return;
    }

    if (!client) {
      await ctx.reply(
        "As simulações estão desativadas. Configure LLM_API_BASE_URL e LLM_MODEL no arquivo .env.",
      );
      return;
    }

    sessions.start(ctx.chat.id, persona);
    await ctx.reply(
      `Simulação iniciada: ${persona.name} — ${persona.description}\n\n${persona.openingMessage}\n\nEnvie /encerrar para terminar a simulação.`,
    );
  });

  router.command("encerrar", async (ctx) => {
    if (sessions.stop(ctx.chat.id)) {
      await ctx.reply(
        "Simulação encerrada. Envie /personas para escolher outro atendimento.",
      );
      return;
    }

    await ctx.reply("Não há uma simulação ativa neste chat.");
  });

  router.on("message:text", async (ctx, next) => {
    const text = ctx.message.text;
    const session = sessions.get(ctx.chat.id);

    if (!session || text.startsWith("/")) {
      await next();
      return;
    }

    if (!client) {
      await ctx.reply(
        "As simulações estão desativadas. Configure LLM_API_BASE_URL e LLM_MODEL no arquivo .env.",
      );
      return;
    }

    try {
      const reply = await client.generateReply(session.persona, [
        ...session.history,
        { role: "user", content: text },
      ]);
      sessions.addTurn(ctx.chat.id, text, reply);
      await ctx.reply(reply);
    } catch (error) {
      onError(error, session.persona);
      await ctx.reply(
        "Não consegui gerar uma resposta agora. Verifique a configuração e a disponibilidade do provedor de IA e tente novamente.",
      );
    }
  });

  return router;
}
