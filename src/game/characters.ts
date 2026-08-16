import type { CharacterProfile, Role } from './types';

export const characters: CharacterProfile[] = [
  {
    id: 'maya',
    name: 'Maya',
    age: 16,
    archetype: 'Observadora',
    description: 'Percebe detalhes, demora a confiar e costuma lembrar contradições.',
    traits: { technical: 7, skeptical: 9, impulsive: 3, social: 5, memory: 9 },
  },
  {
    id: 'theo',
    name: 'Theo',
    age: 17,
    archetype: 'Analítico',
    description: 'Gosta de explicar tudo com lógica e costuma confiar em evidências técnicas.',
    traits: { technical: 9, skeptical: 7, impulsive: 3, social: 4, memory: 8 },
  },
  {
    id: 'luna',
    name: 'Luna',
    age: 15,
    archetype: 'Sociável',
    description: 'Lê bem as pessoas, conversa muito e pode ser influenciada pela confiança do grupo.',
    traits: { technical: 4, skeptical: 5, impulsive: 7, social: 10, memory: 6 },
  },
  {
    id: 'caio',
    name: 'Caio',
    age: 16,
    archetype: 'Competitivo',
    description: 'Assume riscos, provoca os outros e prefere agir a esperar.',
    traits: { technical: 6, skeptical: 4, impulsive: 9, social: 6, memory: 5 },
  },
  {
    id: 'nina',
    name: 'Nina',
    age: 16,
    archetype: 'Conciliadora',
    description: 'Evita conclusões rápidas, cruza versões e tenta manter o grupo trabalhando junto.',
    traits: { technical: 5, skeptical: 7, impulsive: 2, social: 9, memory: 8 },
  },
];

export const roleLabels: Record<Role, string> = {
  thief: 'Ladrão Digital',
  detective: 'Detetive',
  spy: 'Espião',
  resident: 'Morador',
};

export const roleObjectives: Record<Role, string> = {
  thief: 'Desvie a investigação e faça o grupo confiar em pelo menos uma decisão insegura sem revelar seu papel.',
  detective: 'Cruze evidências, encontre contradições e conduza o grupo até o Ladrão Digital.',
  spy: 'Use sua informação parcial para ajudar a investigação sem entregar cedo demais o que você sabe.',
  resident: 'Proteja o grupo, questione as evidências e ajude a identificar quem está manipulando a investigação.',
};

export function getCharacter(id: CharacterProfile['id']) {
  const character = characters.find((item) => item.id === id);
  if (!character) throw new Error(`Unknown character: ${id}`);
  return character;
}
