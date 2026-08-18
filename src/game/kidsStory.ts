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

export type KidsGameId = 'case-002' | 'case-004' | 'case-005';

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

/**
 * Case 004 is the first new adventure built directly from STORY_STANDARD.md.
 * It mirrors Case 002's seven-beat learning arc while teaching photo privacy.
 */
export const fourthKidsStory = {
  id: 'case-004' as KidsGameId,
  number: '004',
  title: 'A Foto que Contava Demais',
  subtitle: 'Descubra o que uma foto pode revelar antes de compartilhar.',
  age: '7–10 anos',
  accent: '#ffd44f',
  cover: '/game/assets/case-004/00_capa_a_foto_que_contava_demais.png',
  scenes: {
    warning: '/game/assets/case-004/01_luna_foto_conta_demais.png',
    clues: '/game/assets/case-004/02_maya_pistas_da_foto.png',
    principle: '/game/assets/case-004/03_theo_foto_segura.png',
    permission: '/game/assets/case-004/04_nina_pedir_permissao.png',
    risk: '/game/assets/case-004/05_caio_mensagem_invasiva.png',
    shield: '/game/assets/case-004/06_luna_escudo_da_foto.png',
    ending: '/game/assets/case-004/07_final_foto_protegida.png',
  },
} as const;

/**
 * Case 005 follows the gold-standard story rhythm while teaching safe online play.
 */
export const fifthKidsStory = {
  id: 'case-005' as KidsGameId,
  number: '005',
  title: 'O Jogador Desconhecido',
  subtitle: 'Jogue com segurança quando alguém que você não conhece aparece.',
  age: '7–10 anos',
  accent: '#55d8ff',
  cover: '/game/assets/case-005/00_capa_o_jogador_desconhecido.png',
  scenes: {
    warning: '/game/assets/case-005/01_luna_convite_inesperado.png',
    personal: '/game/assets/case-005/02_maya_informacao_pessoal.png',
    app: '/game/assets/case-005/03_theo_mudar_de_aplicativo.png',
    limits: '/game/assets/case-005/04_nina_colocar_limites.png',
    pressure: '/game/assets/case-005/05_caio_pedido_de_foto.png',
    shield: '/game/assets/case-005/06_luna_escudo_do_jogador.png',
    ending: '/game/assets/case-005/07_final_jogue_proteja_peca_ajuda.png',
  },
} as const;

export const kidsGames = [fifthKidsStory, fourthKidsStory, secondKidsStory] as const;
export const case002Assets = [secondKidsStory.cover, ...Object.values(secondKidsStory.scenes)];
export const case004Assets = [fourthKidsStory.cover, ...Object.values(fourthKidsStory.scenes)];
export const case005Assets = [fifthKidsStory.cover, ...Object.values(fifthKidsStory.scenes)];

export const passwordHabits = [
  { id: 'long', label: 'Usar uma senha longa', icon: '📏', correct: true },
  { id: 'unique', label: 'Uma senha diferente em cada conta', icon: '🗝️', correct: true },
  { id: 'secret', label: 'Manter códigos de verificação em segredo', icon: '🤫', correct: true },
  { id: 'birthday', label: 'Usar aniversário ou nome', icon: '🎂', correct: false },
  { id: 'reuse', label: 'Repetir a mesma senha em tudo', icon: '🔁', correct: false },
] as const;

export const photoHabits = [
  { id: 'background', label: 'Olhar o fundo antes de postar', icon: '👀', correct: true },
  { id: 'permission', label: 'Pedir permissão para quem aparece', icon: '🤝', correct: true },
  { id: 'location', label: 'Esconder localização e informações pessoais', icon: '📍', correct: true },
  { id: 'rush', label: 'Postar sem conferir', icon: '⚡', correct: false },
  { id: 'details', label: 'Mostrar escola e endereço', icon: '🏫', correct: false },
] as const;


export const playerHabits = [
  { id: 'private', label: 'Proteger informações pessoais', icon: '🛡️', correct: true },
  { id: 'stay', label: 'Não sair do jogo por pressão', icon: '🎮', correct: true },
  { id: 'adult', label: 'Pedir ajuda a um adulto', icon: '🤝', correct: true },
  { id: 'photo', label: 'Mandar foto para agradar', icon: '📸', correct: false },
  { id: 'details', label: 'Passar escola, telefone ou endereço', icon: '🏫', correct: false },
] as const;
