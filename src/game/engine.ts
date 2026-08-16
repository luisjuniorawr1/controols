import { characters, getCharacter, roleObjectives } from './characters';
import type {
  CharacterId,
  GameSession,
  Observation,
  PlayerView,
  PrivatePlayerState,
  Role,
  Seat,
} from './types';

const characterIds = characters.map((character) => character.id);

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const next = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[next]] = [copy[next], copy[index]];
  }
  return copy;
}

function blankSuspicion(): Record<CharacterId, number> {
  return Object.fromEntries(characterIds.map((id) => [id, 10])) as Record<CharacterId, number>;
}

export function createGameSession(humanIds: CharacterId[]): GameSession {
  const uniqueHumans = [...new Set(humanIds)];
  if (uniqueHumans.length < 1 || uniqueHumans.length > 5) {
    throw new Error('A session must have between one and five human players.');
  }

  const roles = shuffle<Role>(['thief', 'detective', 'spy', 'resident', 'resident']);
  const seats: Seat[] = characters.map((character, index) => ({
    characterId: character.id,
    controller: uniqueHumans.includes(character.id) ? 'human' : 'bot',
    role: roles[index],
  }));

  const thiefId = seats.find((seat) => seat.role === 'thief')!.characterId;
  const detectiveId = seats.find((seat) => seat.role === 'detective')!.characterId;
  const spyId = seats.find((seat) => seat.role === 'spy')!.characterId;
  const decoyId = shuffle(characterIds.filter((id) => id !== thiefId))[0];

  const privateByCharacter = Object.fromEntries(
    seats.map((seat) => {
      const observations: Observation[] = [];

      if (seat.role === 'detective') {
        observations.push({
          id: 'detective-domain-age',
          text: 'Sua consulta forense mostra que aurora-acesso-seguro.net foi registrado hoje, às 21:16.',
        });
      }

      if (seat.role === 'spy') {
        observations.push({
          id: 'spy-route-pair',
          text: `Uma interceptação parcial liga o acesso antes das 23:45 a ${getCharacter(thiefId).name} ou ${getCharacter(decoyId).name}. Você não sabe qual dos dois.`,
          relatedCharacterId: thiefId,
          suspicionDelta: 18,
        });
        observations.push({
          id: 'spy-route-decoy',
          text: 'O dado está incompleto; tratar qualquer um dos dois como culpado sem outra evidência seria precipitado.',
          relatedCharacterId: decoyId,
          suspicionDelta: 10,
        });
      }

      if (seat.role === 'thief') {
        observations.push({
          id: 'thief-private-action',
          text: 'Você sabe que participou do incidente. Seu desafio é parecer útil e deslocar a suspeita sem saber quem são Detetive e Espião.',
        });
      }

      const privateState: PrivatePlayerState = {
        characterId: seat.characterId,
        role: seat.role,
        objective: roleObjectives[seat.role],
        observations,
        suspicions: blankSuspicion(),
      };
      return [seat.characterId, privateState];
    }),
  ) as Record<CharacterId, PrivatePlayerState>;

  return {
    seats,
    thiefId,
    detectiveId,
    spyId,
    decoyId,
    publicEvents: [
      { id: 'alert', at: '23:42', text: 'Uma mensagem de “Administração Aurora” pede atualização urgente do acesso.' },
      { id: 'camera', at: '23:52', text: 'A câmera 03 do condomínio fica offline.' },
    ],
    privateByCharacter,
  };
}

export function playerView(session: GameSession, characterId: CharacterId): PlayerView {
  return {
    me: session.privateByCharacter[characterId],
    publicEvents: session.publicEvents,
    seats: session.seats.map(({ characterId: id, controller }) => ({ characterId: id, controller })),
  };
}

export function botDiscussionLine(view: PlayerView, selectedSignals: string[]): string {
  const character = getCharacter(view.me.characterId);
  const selectedDomainAge = selectedSignals.includes('domain-age');
  const selectedHttps = selectedSignals.includes('https');

  if (view.me.role === 'thief') {
    if (selectedDomainAge) return 'Domínio novo é estranho, mas não prova que a mensagem é falsa. Eu buscaria outra evidência antes de acusar alguém.';
    return 'A mensagem é urgente, mas isso também acontece em avisos reais. Não acho seguro concluir só pela aparência.';
  }

  if (character.traits.technical >= 8) {
    return selectedHttps
      ? 'HTTPS só protege a conexão. Um site falso também pode ter cadeado. O domínio e a origem importam mais.'
      : 'Quero comparar o domínio com algum canal oficial e olhar quando ele foi registrado.';
  }

  if (character.traits.social >= 9) {
    return 'Antes de decidir, cada um devia dizer se abriu o link e o que apareceu. As versões podem revelar uma contradição.';
  }

  if (character.traits.impulsive >= 8) {
    return 'Eu bloquearia o link agora e depois investigaria. Esperar demais pode piorar se alguém já tiver clicado.';
  }

  if (character.traits.skeptical >= 8) {
    return 'Urgência, domínio diferente e remetente desconhecido juntos são fortes sinais de manipulação.';
  }

  return 'Ainda não tenho certeza. Eu cruzaria o horário da mensagem com os registros dos dispositivos.';
}

export function botVote(
  view: PlayerView,
  publicClues: Observation[],
  candidates: CharacterId[],
): CharacterId {
  const character = getCharacter(view.me.characterId);
  const scores = blankSuspicion();

  for (const observation of [...view.me.observations, ...publicClues]) {
    if (!observation.relatedCharacterId || observation.suspicionDelta === undefined) continue;
    const weight = 0.75 + (character.traits.memory + character.traits.skeptical) / 20;
    scores[observation.relatedCharacterId] += observation.suspicionDelta * weight;
  }

  if (view.me.role === 'thief') {
    scores[view.me.characterId] = -999;
    for (const candidate of candidates) {
      if (candidate !== view.me.characterId) scores[candidate] += getCharacter(candidate).traits.impulsive * 0.7;
    }
  }

  return candidates
    .filter((candidate) => candidate !== view.me.characterId)
    .sort((a, b) => scores[b] - scores[a] || a.localeCompare(b))[0];
}

export function roleHint(role: Role): string {
  if (role === 'thief') return 'Você não conhece os outros papéis. Observe quem parece ter informação demais e use isso para desviar a investigação.';
  if (role === 'detective') return 'Sua vantagem é evidência técnica, não conhecimento de identidade. O culpado ainda precisa ser deduzido.';
  if (role === 'spy') return 'Sua pista é parcial. Ela reduz possibilidades, mas não identifica o Ladrão Digital.';
  return 'Você não recebe informação privilegiada. Seu poder é observar, comparar versões e votar bem.';
}
