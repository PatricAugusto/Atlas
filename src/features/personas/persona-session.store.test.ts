import { describe, expect, it } from "vitest";
import { findPersona } from "./persona.js";
import { PersonaSessionStore } from "./persona-session.store.js";

const persona = findPersona("impressora")!;

describe("PersonaSessionStore", () => {
  it("starts a session with the persona opening message", () => {
    const sessions = new PersonaSessionStore();
    const session = sessions.start(10, persona);

    expect(sessions.get(10)).toBe(session);
    expect(session.history).toEqual([
      { role: "assistant", content: persona.openingMessage },
    ]);
  });

  it("keeps separate conversations per chat", () => {
    const sessions = new PersonaSessionStore();

    sessions.start(10, persona);
    sessions.start(20, persona);

    expect(sessions.get(10)).not.toBe(sessions.get(20));
  });

  it("appends conversation turns and limits stored history", () => {
    const sessions = new PersonaSessionStore(4);
    sessions.start(10, persona);
    sessions.addTurn(10, "Aparece offline.", "Ela está conectada ao Wi-Fi?");
    sessions.addTurn(10, "Sim, está conectada.", "Você consegue reiniciá-la?");

    expect(sessions.get(10)?.history).toEqual([
      { role: "user", content: "Aparece offline." },
      { role: "assistant", content: "Ela está conectada ao Wi-Fi?" },
      { role: "user", content: "Sim, está conectada." },
      { role: "assistant", content: "Você consegue reiniciá-la?" },
    ]);
  });

  it("removes sessions when stopped", () => {
    const sessions = new PersonaSessionStore();
    sessions.start(10, persona);

    expect(sessions.stop(10)).toBe(true);
    expect(sessions.get(10)).toBeUndefined();
    expect(sessions.stop(10)).toBe(false);
  });

  it("rejects invalid history limits and missing sessions", () => {
    expect(() => new PersonaSessionStore(1)).toThrow(
      "O histórico deve permitir pelo menos duas mensagens.",
    );
    expect(() =>
      new PersonaSessionStore().addTurn(10, "Olá", "Oi"),
    ).toThrow("Não existe uma sessão de persona ativa neste chat.");
  });
});
