export type KidId = 'luna' | 'theo' | 'maya' | 'caio' | 'nina';

export type Kid = {
  id: KidId;
  name: string;
  trait: string;
  color: string;
  asset: string;
};

export const kids: Kid[] = [
  { id: 'luna', name: 'Luna', trait: 'Curiosa', color: '#f6bd22', asset: '/game/assets/characters/luna.webp' },
  { id: 'theo', name: 'Theo', trait: 'Inventor', color: '#1ec4c8', asset: '/game/assets/characters/theo.webp' },
  { id: 'maya', name: 'Maya', trait: 'Observadora', color: '#8b5bd9', asset: '/game/assets/characters/maya.webp' },
  { id: 'caio', name: 'Caio', trait: 'Corajoso', color: '#f2643c', asset: '/game/assets/characters/caio.webp' },
  { id: 'nina', name: 'Nina', trait: 'Cuidadosa', color: '#76ad42', asset: '/game/assets/characters/nina.webp' },
];

export const firstKidsStory = {
  id: 'mysterious-message',
  number: '001',
  title: 'A Mensagem Misteriosa',
  subtitle: 'Uma aventura cooperativa para pensar antes de clicar.',
  age: '7–10 anos',
  scenes: {
    title: '/game/assets/scenes/title-a-mensagem-misteriosa.webp',
    message: '/game/assets/scenes/mensagem-suspeita.webp',
    clues: '/game/assets/scenes/quadro-de-pistas.webp',
    team: '/game/assets/reference/character-lineup.webp',
  },
} as const;

export const redFlags = [
  { id: 'link', label: 'Link estranho', icon: '🔗', correct: true },
  { id: 'rush', label: 'Muita pressa', icon: '⏰', correct: true },
  { id: 'unknown', label: 'Quem enviou?', icon: '❓', correct: true },
  { id: 'lock', label: 'Tem cadeado', icon: '🔒', correct: false },
] as const;

export const safeSteps = [
  { id: 'stop', label: 'Parar antes de clicar', icon: '✋' },
  { id: 'official', label: 'Abrir o app ou site oficial', icon: '📱' },
  { id: 'help', label: 'Pedir ajuda a um adulto de confiança', icon: '🤝' },
] as const;
