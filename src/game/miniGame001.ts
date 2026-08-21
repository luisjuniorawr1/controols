export type Mini001Hand = 'left' | 'right' | 'either';

export type Mini001Hotspot = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hand: Mini001Hand;
  holdMs?: number;
};

export type Mini001Scene = {
  id: string;
  image: string;
  hotspots: readonly Mini001Hotspot[];
  autoAdvance?: boolean;
};

const HOLD_MS = 800;

export const mini001Scenes: readonly Mini001Scene[] = [
  {
    id: 'opening',
    image: '/game/assets/mini-001/00_abertura.webp',
    hotspots: [{ id: 'start', x: .34, y: .79, width: .32, height: .14, hand: 'either' }],
  },
  {
    id: 'tutorial',
    image: '/game/assets/mini-001/01_tutorial.webp',
    hotspots: [{ id: 'school_badge', x: .66, y: .33, width: .18, height: .25, hand: 'right' }],
    autoAdvance: true,
  },
  {
    id: 'park',
    image: '/game/assets/mini-001/02_fase_1_parque.webp',
    hotspots: [{ id: 'location_phone', x: .585, y: .43, width: .13, height: .31, hand: 'right' }],
    autoAdvance: true,
  },
  {
    id: 'house',
    image: '/game/assets/mini-001/03_fase_2_frente_de_casa.webp',
    hotspots: [
      { id: 'house_number', x: .60, y: .30, width: .10, height: .15, hand: 'right' },
      { id: 'street_name', x: .79, y: .36, width: .15, height: .18, hand: 'right' },
    ],
    autoAdvance: true,
  },
  {
    id: 'party',
    image: '/game/assets/mini-001/04_fase_3_festa.webp',
    hotspots: [{ id: 'invitation_address', x: .61, y: .31, width: .22, height: .37, hand: 'right' }],
    autoAdvance: true,
  },
  {
    id: 'study',
    image: '/game/assets/mini-001/05_fase_4_mesa_de_estudos.webp',
    hotspots: [
      { id: 'password', x: .39, y: .37, width: .17, height: .31, hand: 'left' },
      { id: 'phone', x: .61, y: .36, width: .15, height: .32, hand: 'right' },
      { id: 'qr_code', x: .79, y: .39, width: .13, height: .30, hand: 'right' },
    ],
    autoAdvance: true,
  },
  {
    id: 'final',
    image: '/game/assets/mini-001/06_desafio_final.webp',
    hotspots: [
      { id: 'school', x: .06, y: .65, width: .15, height: .24, hand: 'left' },
      { id: 'location', x: .32, y: .66, width: .13, height: .23, hand: 'left' },
      { id: 'password', x: .57, y: .66, width: .11, height: .23, hand: 'right' },
      { id: 'address', x: .82, y: .65, width: .12, height: .24, hand: 'right' },
    ],
    autoAdvance: true,
  },
  {
    id: 'result',
    image: '/game/assets/mini-001/07_resultado.webp',
    hotspots: [
      { id: 'play_again', x: .32, y: .69, width: .38, height: .13, hand: 'either' },
      { id: 'menu', x: .41, y: .84, width: .18, height: .10, hand: 'either' },
    ],
  },
] as const;

export const mini001Assets = mini001Scenes.map(scene => scene.image);
export const MINI001_HOLD_MS = HOLD_MS;
