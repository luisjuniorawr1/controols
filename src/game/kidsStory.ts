export type KidId = 'luna' | 'theo' | 'maya' | 'caio' | 'nina';

export type Kid = {
  id: KidId;
  name: string;
  trait: string;
  color: string;
  asset: string;
};

export const kids: Kid[] = [
  { id: 'luna', name: 'Luna', trait: 'Curiosa', color: '#f6bd22', asset: '/game/assets/characters/luna.png' },
  { id: 'theo', name: 'Theo', trait: 'Inventor', color: '#1ec4c8', asset: '/game/assets/characters/theo.png' },
  { id: 'maya', name: 'Maya', trait: 'Observadora', color: '#8b5bd9', asset: '/game/assets/characters/maya.png' },
  { id: 'caio', name: 'Caio', trait: 'Corajoso', color: '#f2643c', asset: '/game/assets/characters/caio.png' },
  { id: 'nina', name: 'Nina', trait: 'Cuidadosa', color: '#76ad42', asset: '/game/assets/characters/nina.png' },
];

export const firstKidsStory = {
  id: 'mysterious-message',
  number: '001',
  title: 'A Mensagem Misteriosa',
  subtitle: 'Uma aventura para pensar antes de clicar.',
  age: '7–10 anos',
  scenes: {
    title: '/game/assets/v2/01-hub.svg',
    message: '/game/assets/v2/02-message.svg',
    clues: '/game/assets/v2/03-clues.svg',
    https: '/game/assets/v2/04-lock.svg',
    action: '/game/assets/v2/05-action.svg',
    team: '/game/assets/v2/06-team.svg',
    shield: '/game/assets/v2/07-shield.svg',
    ending: '/game/assets/v2/08-finale.svg',
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
