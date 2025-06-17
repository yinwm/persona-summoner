import { Persona, PersonaRepository } from './types.js';

export class InMemoryPersonaRepository implements PersonaRepository {
  private personas: Map<string, Persona> = new Map();

  constructor(initialPersonas: Persona[] = []) {
    for (const persona of initialPersonas) {
      this.personas.set(persona.id, persona);
    }
  }

  async getPersona(id: string): Promise<Persona | null> {
    return this.personas.get(id) || null;
  }

  async getAllPersonas(): Promise<Persona[]> {
    return Array.from(this.personas.values());
  }

  async addPersona(persona: Persona): Promise<void> {
    this.personas.set(persona.id, persona);
  }

  async updatePersona(id: string, updates: Partial<Persona>): Promise<void> {
    const existing = this.personas.get(id);
    if (existing) {
      this.personas.set(id, { ...existing, ...updates });
    }
  }

  async deletePersona(id: string): Promise<void> {
    this.personas.delete(id);
  }
}