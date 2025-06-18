import { Persona, PersonaRepository } from './types.js';
import { PERSONA_SOURCES, defaultPersonas } from './persona-sources.js';

const FETCH_TIMEOUT = 5000; // 5 seconds

export class RemotePersonaRepository implements PersonaRepository {
  private personas: Map<string, Persona> = new Map();
  private lastFetchTime: number = 0;
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutes cache

  constructor() {
    this.warmUpCache();
  }

  private async warmUpCache() {
    await this.getAllPersonas();
  }
  
  private async fetchPersonasFromSource(url: string): Promise<Persona[] | null> {
    try {
      console.error(`Fetching personas from: ${url}`);
      const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
      if (response.ok) {
        // Assuming the hub provides a JSON array of personas
        const data = await response.json();
        console.error(`Successfully fetched personas from: ${url}`);
        return Array.isArray(data) ? data : null;
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          console.warn(`Timeout fetching from ${url}`);
        } else {
          console.warn(`Failed to fetch from ${url}:`, error.message);
        }
      } else {
        console.warn(`An unknown error occurred while fetching from ${url}:`, String(error));
      }
    }
    return null;
  }

  async getPersona(id: string): Promise<Persona | null> {
    const personas = await this.getAllPersonas();
    return personas.find(p => p.id === id) || null;
  }

  async getAllPersonas(): Promise<Persona[]> {
    const now = Date.now();
    if (now - this.lastFetchTime < this.cacheDuration && this.personas.size > 0) {
      return Array.from(this.personas.values());
    }

    for (const url of PERSONA_SOURCES) {
      const freshPersonas = await this.fetchPersonasFromSource(url);
      if (freshPersonas) {
        this.updateCache(freshPersonas);
        return freshPersonas;
      }
    }
    
    console.warn('All remote sources failed. Falling back to default personas.');
    this.updateCache(defaultPersonas);
    return defaultPersonas;
  }
  
  private updateCache(personas: Persona[]) {
    this.personas.clear();
    for (const persona of personas) {
      this.personas.set(persona.id, persona);
    }
    this.lastFetchTime = Date.now();
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