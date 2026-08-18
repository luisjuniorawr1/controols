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

export type KidsGameId = 'case-001' | 'case-002' | 'case-003';

export const firstKidsStory = {
  id: 'case-001' as KidsGameId,
  number: '001',
  title: 'A Mensagem Misteriosa',
  subtitle: 'Pense antes de clicar.',
  age: '7–10 anos',
  accent: '#ffd24f',
  cover: '/game/assets/v2-real/01_capa_hub.png',
  scenes: {
    message: '/game/assets/v2-real/02_luna_mensagem_suspeita.png',
    clues: '/game/assets/v2-real/03_maya_pistas.png',
    https: '/game/assets/v2-real/04_theo_cadeado.png',
    action: '/game/assets/v2-real/05_nina_escolhas_seguras.png',
    team: '/game/assets/v2-real/06_maya_caio_duas_respostas.png',
    shield: '/game/assets/v2-real/07_luna_escudo_digital.png',
    ending: '/game/assets/v2-real/08_final_turma_comemorando.png',
  },
} as const;

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

const CASE003_ASSET_VERSION = 'v4-20260817';
const case003Asset = (name: string) => `/game/assets/case-003/${name}?${CASE003_ASSET_VERSION}`;

export const thirdKidsStory = {
  id: 'case-003' as KidsGameId,
  number: '003',
  title: 'O Link Fantasma',
  subtitle: 'Nem todo link é o que parece.',
  age: '7–10 anos',
  accent: '#b98cff',
  cover: case003Asset('00_capa_link_fantasma.png'),
  scenes: {
    warning: case003Asset('01_luna_link_suspeito.png'),
    clues: case003Asset('02_maya_pistas_link.png'),
    address: case003Asset('03_endereco_suspeito.png'),
    path: case003Asset('04_nina_caminho_oficial.png'),
    clone: case003Asset('05_caio_pagina_pede_codigo.png'),
    map: case003Asset('06_luna_mapa_link_seguro.png'),
    ending: case003Asset('07_final_link_desmascarado.png'),
  },
} as const;

export const kidsGames = [firstKidsStory, secondKidsStory, thirdKidsStory] as const;

export const case001Assets = [firstKidsStory.cover, ...Object.values(firstKidsStory.scenes)];
export const case002Assets = [secondKidsStory.cover, ...Object.values(secondKidsStory.scenes)];
export const case003Assets = [thirdKidsStory.cover, ...Object.values(thirdKidsStory.scenes)];

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

export const passwordHabits = [
  { id: 'long', label: 'Usar uma senha longa', icon: '📏', correct: true },
  { id: 'unique', label: 'Uma senha diferente em cada conta', icon: '🗝️', correct: true },
  { id: 'secret', label: 'Manter códigos de verificação em segredo', icon: '🤫', correct: true },
  { id: 'birthday', label: 'Usar aniversário ou nome', icon: '🎂', correct: false },
  { id: 'reuse', label: 'Repetir a mesma senha em tudo', icon: '🔁', correct: false },
] as const;

export const linkHabits = [
  { id: 'read', label: 'Ler o endereço inteiro', icon: '🔎', correct: true },
  { id: 'official', label: 'Abrir pelo app ou site oficial', icon: '📱', correct: true },
  { id: 'help', label: 'Pedir ajuda se tiver dúvida', icon: '🤝', correct: true },
  { id: 'lock', label: 'Confiar só porque tem cadeado', icon: '🔒', correct: false },
  { id: 'looks', label: 'Confiar só porque parece bonito', icon: '🎨', correct: false },
] as const;
