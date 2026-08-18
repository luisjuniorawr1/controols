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

export type KidsGameId = 'case-002';

/**
 * O Cofre das Senhas is the canonical CONTROOLS story reference.
 * New adventures should reuse its seven-beat narrative rhythm, one-screen
 * interaction model, character rotation and full-resolution art contract.
 */
export const secondKidsStory = {
  id: 'case-002' as KidsGameId,
  number: '002',
  title: 'O Cofre das Senhas',
  subtitle: 'Proteja seus segredos digitais.',
  age: '7–10 anos',
  accent: '#68d5ff',
  cover: '/game/assets/case-002/00_capa_cofre_das_senhas.png',
  scenes: {
    warning: '/game/assets/case-002/01_tentativa_senha_fraca.png',
    weak: '/game/assets/case-002/02_maya_senhas_fracas.png',
    strong: '/game/assets/case-002/03_theo_senha_forte.png',
    reuse: '/game/assets/case-002/04_nina_reutilizar_senha.png',
    code: '/game/assets/case-002/05_caio_codigo_secreto.png',
    key: '/game/assets/case-002/06_luna_chave_mestra.png',
    ending: '/game/assets/case-002/07_final_cofre_protegido.png',
  },
} as const;

export const kidsGames = [secondKidsStory] as const;
export const case002Assets = [secondKidsStory.cover, ...Object.values(secondKidsStory.scenes)];

export const passwordHabits = [
  { id: 'long', label: 'Usar uma senha longa', icon: '📏', correct: true },
  { id: 'unique', label: 'Uma senha diferente em cada conta', icon: '🗝️', correct: true },
  { id: 'secret', label: 'Manter códigos de verificação em segredo', icon: '🤫', correct: true },
  { id: 'birthday', label: 'Usar aniversário ou nome', icon: '🎂', correct: false },
  { id: 'reuse', label: 'Repetir a mesma senha em tudo', icon: '🔁', correct: false },
] as const;
