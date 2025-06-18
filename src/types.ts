export interface Persona {
  id: string;
  name: string;
  rule: string;
  goal: string;
  version: string;
  description?: string;
  category?: string;
  tags?: string[];
  source?: 'local' | 'remote' | 'default';
}

export interface PersonaRepository {
  getPersona(id: string): Promise<Persona | null>;
  getAllPersonas(): Promise<Persona[]>;
}