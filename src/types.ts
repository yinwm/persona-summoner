export interface Persona {
  id: string;
  name: string;
  rule: string;
  goal: string;
  version: string;
}

export interface PersonaRepository {
  getPersona(id: string): Promise<Persona | null>;
  getAllPersonas(): Promise<Persona[]>;
  addPersona(persona: Persona): Promise<void>;
  updatePersona(id: string, persona: Partial<Persona>): Promise<void>;
  deletePersona(id: string): Promise<void>;
}