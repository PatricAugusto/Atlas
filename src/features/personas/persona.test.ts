import { describe, expect, it } from "vitest";
import {
  createPersonaSystemPrompt,
  findPersona,
  formatPersonaCatalog,
  personas,
} from "./persona.js";

describe("persona catalog", () => {
  it("provides unique personas with realistic opening messages", () => {
    expect(new Set(personas.map((persona) => persona.id)).size).toBe(
      personas.length,
    );
    expect(personas.length).toBeGreaterThanOrEqual(3);

    for (const persona of personas) {
      expect(persona.name).not.toBe("");
      expect(persona.description).not.toBe("");
      expect(persona.scenario).not.toBe("");
      expect(persona.openingMessage).not.toBe("");
    }
  });

  it("finds personas without case sensitivity", () => {
    expect(findPersona("IMPRESSORA")?.id).toBe("impressora");
    expect(findPersona("inexistente")).toBeUndefined();
  });

  it("formats the catalog with a usable start command", () => {
    expect(formatPersonaCatalog()).toContain("/persona impressora");
    expect(formatPersonaCatalog()).toContain("Wi-Fi instável");
  });

  it("instructs the model to stay in character and protect secrets", () => {
    const prompt = createPersonaSystemPrompt(personas[0]);

    expect(prompt).toContain(personas[0].scenario);
    expect(prompt).toContain("nunca dê instruções de suporte");
    expect(prompt).toContain("senhas, códigos de autenticação");
  });
});
