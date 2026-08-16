export type CharacterId = 'maya' | 'theo' | 'luna' | 'caio' | 'nina';
export type Role = 'thief' | 'detective' | 'spy' | 'resident';
export type ControllerKind = 'human' | 'bot';

export type TraitSet = {
  technical: number;
  skeptical: number;
  impulsive: number;
  social: number;
  memory: number;
};

export type CharacterProfile = {
  id: CharacterId;
  name: string;
  age: number;
  archetype: string;
  description: string;
  traits: TraitSet;
};

export type Seat = {
  characterId: CharacterId;
  controller: ControllerKind;
  role: Role;
};

export type Observation = {
  id: string;
  text: string;
  relatedCharacterId?: CharacterId;
  suspicionDelta?: number;
};

export type PrivatePlayerState = {
  characterId: CharacterId;
  role: Role;
  objective: string;
  observations: Observation[];
  suspicions: Record<CharacterId, number>;
};

export type PublicEvent = {
  id: string;
  at: string;
  text: string;
  actorId?: CharacterId;
};

export type GameSession = {
  seats: Seat[];
  thiefId: CharacterId;
  detectiveId: CharacterId;
  spyId: CharacterId;
  decoyId: CharacterId;
  publicEvents: PublicEvent[];
  privateByCharacter: Record<CharacterId, PrivatePlayerState>;
};

export type PlayerView = {
  me: PrivatePlayerState;
  publicEvents: PublicEvent[];
  seats: Array<Pick<Seat, 'characterId' | 'controller'>>;
};
