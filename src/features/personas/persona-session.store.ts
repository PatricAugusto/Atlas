import type { Persona, PersonaMessage } from "./persona.js";

export interface PersonaSession {
  persona: Persona;
  history: PersonaMessage[];
}

export class PersonaSessionStore {
  private readonly sessions = new Map<number, PersonaSession>();

  constructor(private readonly maxHistoryMessages = 20) {
    if (!Number.isInteger(maxHistoryMessages) || maxHistoryMessages < 2) {
      throw new Error("O histórico deve permitir pelo menos duas mensagens.");
    }
  }

  start(chatId: number, persona: Persona): PersonaSession {
    const session: PersonaSession = {
      persona,
      history: [{ role: "assistant", content: persona.openingMessage }],
    };
    this.sessions.set(chatId, session);
    return session;
  }

  get(chatId: number): PersonaSession | undefined {
    return this.sessions.get(chatId);
  }

  addTurn(chatId: number, userMessage: string, personaReply: string): void {
    const session = this.sessions.get(chatId);
    if (!session) {
      throw new Error("Não existe uma sessão de persona ativa neste chat.");
    }

    session.history.push(
      { role: "user", content: userMessage },
      { role: "assistant", content: personaReply },
    );

    if (session.history.length > this.maxHistoryMessages) {
      session.history.splice(
        0,
        session.history.length - this.maxHistoryMessages,
      );
    }
  }

  stop(chatId: number): boolean {
    return this.sessions.delete(chatId);
  }
}
