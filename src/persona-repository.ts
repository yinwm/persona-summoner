import { Persona, PersonaRepository } from './types.js';
import { PERSONA_SOURCES, defaultPersonas } from './persona-sources.js';

const FETCH_TIMEOUT = 15000; // 15 seconds

export class RemotePersonaRepository implements PersonaRepository {
  private personas: Map<string, Persona> = new Map();
  private lastFetchTime: number = 0;
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutes cache
  private localPersonas: Persona[] = [];

  constructor(localPersonas: Persona[] = []) {
    this.localPersonas = localPersonas.map(p => ({ ...p, source: 'local' as const }));
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
        return Array.isArray(data) ? data.map(p => ({ ...p, source: 'remote' as const })) : null;
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

  private mergePersonas(basePersonas: Persona[]): Persona[] {
    const mergedMap = new Map<string, Persona>();
    
    // 先添加基础人格（远程或默认）
    for (const persona of basePersonas) {
      mergedMap.set(persona.id, persona);
    }
    
    // 添加本地人格，如果有相同 ID 则覆盖
    for (const persona of this.localPersonas) {
      mergedMap.set(persona.id, persona);
    }
    
    return Array.from(mergedMap.values());
  }

  async getPersona(id: string): Promise<Persona | null> {
    const personas = await this.getAllPersonas();
    return personas.find(p => p.id === id) || null;
  }

  async getAllPersonas(): Promise<Persona[]> {
    const now = Date.now();
    if (now - this.lastFetchTime < this.cacheDuration && this.personas.size > 0) {
      return this.mergePersonas(Array.from(this.personas.values()));
    }

    for (const url of PERSONA_SOURCES) {
      const freshPersonas = await this.fetchPersonasFromSource(url);
      if (freshPersonas) {
        this.updateCache(freshPersonas);
        return this.mergePersonas(freshPersonas);
      }
    }
    
    console.warn('All remote sources failed. Falling back to default personas.');
    const defaultWithSource = defaultPersonas.map(p => ({ ...p, source: 'default' as const }));
    this.updateCache(defaultWithSource);
    return this.mergePersonas(defaultWithSource);
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