'use client';

import { useMemo, useState } from 'react';
import { characters, getCharacter, roleLabels } from '@/src/game/characters';
import { botDiscussionLine, botVote, createGameSession, playerView, roleHint } from '@/src/game/engine';
import { firstStory, inspectorSignals, phoneApps, timelineEvents } from '@/src/game/firstStory';
import type { CharacterId, GameSession, Observation } from '@/src/game/types';

type Screen = 'lobby' | 'briefing' | 'message' | 'inspector' | 'discussion' | 'timeline' | 'phone' | 'vote' | 'ending';

type VoteResult = {
  votes: Array<{ voter: CharacterId; target: CharacterId }>;
  counts: Record<CharacterId, number>;
  accusedId: CharacterId;
  thiefCaught: boolean;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const next = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[next]] = [copy[next], copy[index]];
  }
  return copy;
}

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function Brand() {
  return <div className="story-brand" aria-label="Controols"><span>CONTR</span><b>OO</b><span>LS</span></div>;
}

function Avatar({ id, small = false }: { id: CharacterId; small?: boolean }) {
  const character = getCharacter(id);
  return <div className={`story-avatar avatar-${id}${small ? ' is-small' : ''}`} aria-hidden="true">{initials(character.name)}</div>;
}

function Progress({ screen }: { screen: Screen }) {
  const ordered: Screen[] = ['briefing', 'message', 'inspector', 'discussion', 'timeline', 'phone', 'vote', 'ending'];
  const index = Math.max(0, ordered.indexOf(screen));
  return <div className="story-progress" aria-label={`Etapa ${index + 1} de ${ordered.length}`}><span style={{ width: `${((index + 1) / ordered.length) * 100}%` }} /></div>;
}

export default function StoryPrototype() {
  const [humanId, setHumanId] = useState<CharacterId>('maya');
  const [session, setSession] = useState<GameSession | null>(null);
  const [screen, setScreen] = useState<Screen>('lobby');
  const [messageEvidence, setMessageEvidence] = useState<string | null>(null);
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [inspectorDone, setInspectorDone] = useState(false);
  const [discussionChoice, setDiscussionChoice] = useState<string | null>(null);
  const [timelinePool, setTimelinePool] = useState(() => shuffle(timelineEvents));
  const [timelineOrder, setTimelineOrder] = useState<string[]>([]);
  const [timelineChecked, setTimelineChecked] = useState<boolean | null>(null);
  const [inspectedApps, setInspectedApps] = useState<string[]>([]);
  const [vote, setVote] = useState<CharacterId | null>(null);
  const [result, setResult] = useState<VoteResult | null>(null);

  const myView = useMemo(() => session ? playerView(session, humanId) : null, [session, humanId]);
  const botSeats = useMemo(() => session?.seats.filter((seat) => seat.controller === 'bot') ?? [], [session]);

  const publicClues = useMemo<Observation[]>(() => {
    if (!session) return [];
    const clues: Observation[] = [];
    if (inspectedApps.includes('security')) {
      clues.push({
        id: 'network-device-link',
        text: `O log da rede associa a abertura do link às 23:44 ao dispositivo de ${getCharacter(session.thiefId).name}.`,
        relatedCharacterId: session.thiefId,
        suspicionDelta: 34,
      });
    }
    if (inspectedApps.includes('mail')) {
      clues.push({ id: 'unknown-login', text: 'Um Chrome no Windows entrou na conta às 23:46 a partir de uma localização não reconhecida.' });
    }
    if (inspectedApps.includes('messages')) {
      clues.push({ id: 'admin-denial', text: 'A administração confirma que não enviou nenhuma atualização de acesso naquela noite.' });
    }
    if (discussionChoice === 'contradictions') {
      clues.push({ id: 'group-contradictions', text: 'O grupo decidiu registrar quem abriu o link e comparar as versões antes de acusar alguém.' });
    }
    return clues;
  }, [discussionChoice, inspectedApps, session]);

  function startGame() {
    setSession(createGameSession([humanId]));
    setMessageEvidence(null);
    setSelectedSignals([]);
    setInspectorDone(false);
    setDiscussionChoice(null);
    setTimelinePool(shuffle(timelineEvents));
    setTimelineOrder([]);
    setTimelineChecked(null);
    setInspectedApps([]);
    setVote(null);
    setResult(null);
    setScreen('briefing');
  }

  function toggleSignal(id: string) {
    if (inspectorDone) return;
    setSelectedSignals((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 2 ? [...current, id] : current);
  }

  function chooseTimelineEvent(id: string) {
    if (timelineOrder.includes(id) || timelineChecked === true) return;
    setTimelineOrder((current) => [...current, id]);
    setTimelineChecked(null);
  }

  function checkTimeline() {
    const correct = timelineEvents.every((event, index) => timelineOrder[index] === event.id);
    setTimelineChecked(correct);
  }

  function resetTimeline() {
    setTimelinePool(shuffle(timelineEvents));
    setTimelineOrder([]);
    setTimelineChecked(null);
  }

  function inspectApp(id: string) {
    setInspectedApps((current) => current.includes(id) ? current : current.length < 2 ? [...current, id] : current);
  }

  function finishVote() {
    if (!session || !vote) return;
    const candidateIds = characters.map((character) => character.id);
    const botVotes = botSeats.map((seat) => ({
      voter: seat.characterId,
      target: botVote(playerView(session, seat.characterId), publicClues, candidateIds),
    }));
    const votes = [{ voter: humanId, target: vote }, ...botVotes];
    const counts = Object.fromEntries(candidateIds.map((id) => [id, 0])) as Record<CharacterId, number>;
    for (const item of votes) counts[item.target] += 1;
    const accusedId = candidateIds.sort((a, b) => counts[b] - counts[a])[0];
    setResult({ votes, counts, accusedId, thiefCaught: accusedId === session.thiefId });
    setScreen('ending');
  }

  if (screen === 'lobby') {
    return <main className="story-shell story-lobby">
      <header className="story-topbar"><Brand/><span className="prototype-chip">PROTÓTIPO 0.1</span></header>
      <section className="case-hero">
        <div className="case-kicker">CONTROOLS // CASO {firstStory.caseNumber}</div>
        <h1>{firstStory.title}</h1>
        <p>{firstStory.subtitle}</p>
        <div className="case-clock"><span>23:42</span><small>{firstStory.location}</small></div>
      </section>

      <section className="lobby-panel" aria-labelledby="choose-character">
        <div className="panel-heading">
          <div><span className="eyebrow">5 PERSONAGENS. SEMPRE.</span><h2 id="choose-character">Escolha quem você vai controlar</h2></div>
          <p>Neste protótipo local, você ocupa uma vaga e as outras quatro são preenchidas por bots. O motor já aceita de 1 a 5 humanos.</p>
        </div>
        <div className="character-grid">
          {characters.map((character) => {
            const selected = character.id === humanId;
            return <button key={character.id} className={`character-card${selected ? ' is-selected' : ''}`} onClick={() => setHumanId(character.id)} type="button">
              <Avatar id={character.id}/>
              <span className="seat-status">{selected ? 'VOCÊ' : 'BOT'}</span>
              <strong>{character.name}</strong>
              <em>{character.archetype}</em>
              <small>{character.description}</small>
            </button>;
          })}
        </div>
        <div className="rule-strip">
          <span>1 Ladrão Digital</span><span>1 Detetive</span><span>1 Espião</span><span>2 Moradores</span>
        </div>
        <button className="story-primary story-start" type="button" onClick={startGame}>Iniciar investigação</button>
        <p className="privacy-rule">Nenhum personagem — humano ou bot — recebe os papéis dos outros. Bots decidem apenas com personalidade, memória, pistas próprias e fatos públicos.</p>
      </section>
    </main>;
  }

  if (!session || !myView) return null;
  const me = getCharacter(humanId);

  return <main className="story-shell story-game">
    <header className="story-topbar game-topbar">
      <Brand/>
      <div className="case-status"><span>CASO {firstStory.caseNumber}</span><b>{firstStory.title}</b></div>
      <div className="player-pill"><Avatar id={humanId} small/><span>{me.name}<small>HUMANO</small></span></div>
    </header>
    <Progress screen={screen}/>

    {screen === 'briefing' && <section className="scene scene-briefing">
      <div className="scene-label">ARQUIVO PRIVADO // SOMENTE VOCÊ</div>
      <div className={`role-card role-${myView.me.role}`}>
        <span>SEU PAPEL SECRETO</span>
        <h1>{roleLabels[myView.me.role]}</h1>
        <p>{myView.me.objective}</p>
        <div className="role-hint">{roleHint(myView.me.role)}</div>
        {myView.me.observations.length > 0 && <div className="private-intel">
          <strong>INFORMAÇÃO INICIAL</strong>
          {myView.me.observations.map((observation) => <p key={observation.id}>{observation.text}</p>)}
        </div>}
      </div>
      <div className="five-seats compact-seats">
        {session.seats.map((seat) => <div key={seat.characterId}><Avatar id={seat.characterId} small/><span>{getCharacter(seat.characterId).name}</span><small>{seat.controller === 'human' ? 'VOCÊ' : 'BOT'} · PAPEL OCULTO</small></div>)}
      </div>
      <button className="story-primary" type="button" onClick={() => setScreen('message')}>Estou pronto</button>
    </section>}

    {screen === 'message' && <section className="scene">
      <div className="scene-label">CENA 01 // A MENSAGEM</div>
      <h1>Uma atualização que ninguém pediu</h1>
      <p className="scene-intro">Todos estão no grupo do condomínio quando uma mensagem aparece às 23:42.</p>
      <div className="phone-frame chat-app">
        <div className="phone-bar"><b>Condomínio Aurora</b><span>23:42</span></div>
        <div className="chat-line system-message">
          <strong>Administração Aurora</strong>
          <p>⚠️ Detectamos uma falha no sistema da portaria. Atualize seu acesso antes da meia-noite para evitar bloqueio.</p>
          <button type="button" className="fake-link">ATUALIZAR ACESSO</button>
        </div>
        <div className="chat-line"><strong>Luna</strong><p>Gente, alguém já fez isso?</p></div>
        <div className="chat-line"><strong>Nina</strong><p>Não lembro de avisarem manutenção...</p></div>
      </div>
      <div className="decision-block">
        <span>O que você investiga primeiro?</span>
        <div className="decision-grid">
          <button type="button" className={messageEvidence === 'sender' ? 'is-active' : ''} onClick={() => setMessageEvidence('sender')}><b>Remetente</b><small>+55 11 99841-7730 · não salvo</small></button>
          <button type="button" className={messageEvidence === 'link' ? 'is-active' : ''} onClick={() => setMessageEvidence('link')}><b>Link</b><small>aurora-acesso-seguro.net</small></button>
          <button type="button" className={messageEvidence === 'history' ? 'is-active' : ''} onClick={() => setMessageEvidence('history')}><b>Histórico</b><small>Nenhum aviso de manutenção hoje</small></button>
        </div>
      </div>
      {messageEvidence && <div className="evidence-reveal"><span>PISTA REGISTRADA</span>{messageEvidence === 'sender' ? 'O número não é o mesmo usado pela administração nas mensagens anteriores.' : messageEvidence === 'link' ? 'O endereço não pertence ao domínio oficial do condomínio.' : 'Não há comunicado anterior sobre falha ou atualização de acesso.'}</div>}
      <button className="story-primary" disabled={!messageEvidence} type="button" onClick={() => setScreen('inspector')}>Abrir Link Inspector</button>
    </section>}

    {screen === 'inspector' && <section className="scene">
      <div className="scene-label">MINI-DESAFIO // LINK INSPECTOR</div>
      <h1>Encontre os dois sinais que você considera mais importantes</h1>
      <div className="inspector-window">
        <div className="inspector-address"><span>https://</span>aurora-acesso-seguro.net</div>
        <div className="signal-grid">
          {inspectorSignals.map((signal) => <button key={signal.id} type="button" onClick={() => toggleSignal(signal.id)} className={selectedSignals.includes(signal.id) ? 'is-selected' : ''}>
            <span className="signal-check">{selectedSignals.includes(signal.id) ? '✓' : '+'}</span><b>{signal.label}</b><small>{signal.detail}</small>
          </button>)}
        </div>
      </div>
      {!inspectorDone ? <button className="story-primary" disabled={selectedSignals.length !== 2} type="button" onClick={() => setInspectorDone(true)}>Registrar análise</button> : <>
        <div className="analysis-result">
          <strong>ANÁLISE SALVA</strong>
          <p>{selectedSignals.includes('https') ? 'Você marcou HTTPS. O cadeado protege a conexão, mas um site falso também pode usar HTTPS. Isso não prova legitimidade.' : 'Você não usou o cadeado como prova de legitimidade — uma boa distinção entre conexão segura e identidade confiável.'}</p>
          <p>Domínio recém-criado, origem desconhecida e pressão de tempo ganham força quando aparecem juntos.</p>
        </div>
        <button className="story-primary" type="button" onClick={() => setScreen('discussion')}>Voltar ao grupo</button>
      </>}
    </section>}

    {screen === 'discussion' && <section className="scene">
      <div className="scene-label">CENA 02 // O GRUPO REAGE</div>
      <h1>Cada personagem interpreta a mesma evidência de um jeito</h1>
      <div className="dialogue-stack">
        {botSeats.map((seat) => <div className="dialogue" key={seat.characterId}><Avatar id={seat.characterId} small/><div><strong>{getCharacter(seat.characterId).name}</strong><p>{botDiscussionLine(playerView(session, seat.characterId), selectedSignals)}</p></div></div>)}
      </div>
      <div className="decision-block">
        <span>Como você conduz a conversa?</span>
        <div className="decision-grid text-decisions">
          <button type="button" className={discussionChoice === 'block' ? 'is-active' : ''} onClick={() => setDiscussionChoice('block')}><b>Bloquear primeiro</b><small>“Ninguém abre mais esse link até sabermos de onde veio.”</small></button>
          <button type="button" className={discussionChoice === 'contradictions' ? 'is-active' : ''} onClick={() => setDiscussionChoice('contradictions')}><b>Comparar versões</b><small>“Quem abriu? Vamos registrar horários antes que alguém mude a história.”</small></button>
          <button type="button" className={discussionChoice === 'wait' ? 'is-active' : ''} onClick={() => setDiscussionChoice('wait')}><b>Guardar a pista</b><small>“Quero ver o que mais acontece antes de mostrar tudo.”</small></button>
        </div>
      </div>
      {discussionChoice && <div className="consequence"><span>CONSEQUÊNCIA</span>{discussionChoice === 'contradictions' ? 'O grupo passa a prestar atenção em contradições. Isso pode pesar na votação final.' : discussionChoice === 'block' ? 'O link é bloqueado no grupo, reduzindo o risco imediato, mas ninguém admite ainda quem clicou.' : 'Você preserva informação, porém os outros continuam discutindo sem uma direção clara.'}</div>}
      <div className="incident-banner"><b>23:52</b><span>CÂMERA 03 // OFFLINE</span></div>
      <button className="story-primary" disabled={!discussionChoice} type="button" onClick={() => setScreen('timeline')}>Investigar o incidente</button>
    </section>}

    {screen === 'timeline' && <section className="scene">
      <div className="scene-label">MINI-DESAFIO // LINHA DO TEMPO</div>
      <h1>Reconstrua a sequência antes que os registros sejam sobrescritos</h1>
      <p className="scene-intro">Selecione os quatro eventos na ordem em que aconteceram.</p>
      <div className="timeline-builder">
        <div className="timeline-slots">
          {[0, 1, 2, 3].map((slot) => {
            const selected = timelineEvents.find((event) => event.id === timelineOrder[slot]);
            return <div key={slot} className={selected ? 'is-filled' : ''}><span>{slot + 1}</span>{selected ? <><b>{selected.at}</b><small>{selected.label}</small></> : <small>Escolha um evento</small>}</div>;
          })}
        </div>
        <div className="timeline-pool">
          {timelinePool.map((event) => <button type="button" key={event.id} disabled={timelineOrder.includes(event.id)} onClick={() => chooseTimelineEvent(event.id)}><b>{event.at}</b><span>{event.label}</span></button>)}
        </div>
      </div>
      {timelineChecked === false && <div className="analysis-result is-warning"><strong>OS HORÁRIOS NÃO FECHAM</strong><p>A sequência cria uma contradição. Revise os registros e tente novamente.</p><button className="story-secondary" type="button" onClick={resetTimeline}>Limpar linha do tempo</button></div>}
      {timelineChecked === true && <div className="analysis-result"><strong>SEQUÊNCIA CONSISTENTE</strong><p>O link foi aberto dois minutos antes do login desconhecido. Se alguém disser que não interagiu com a mensagem, essa versão pode ser testada.</p></div>}
      {timelineChecked !== true ? <button className="story-primary" disabled={timelineOrder.length !== 4} type="button" onClick={checkTimeline}>Verificar sequência</button> : <button className="story-primary" type="button" onClick={() => setScreen('phone')}>Abrir o celular comprometido</button>}
    </section>}

    {screen === 'phone' && <section className="scene">
      <div className="scene-label">CENA 03 // DISPOSITIVO COMPROMETIDO</div>
      <h1>Você só tem tempo para investigar dois aplicativos</h1>
      <div className="phone-investigation">
        <div className="phone-frame app-grid-phone">
          <div className="phone-bar"><b>Dispositivo da rede</b><span>23:56</span></div>
          <div className="phone-app-grid">
            {phoneApps.map((app) => <button type="button" key={app.id} disabled={!inspectedApps.includes(app.id) && inspectedApps.length >= 2} className={inspectedApps.includes(app.id) ? 'is-opened' : ''} onClick={() => inspectApp(app.id)}><span>{app.icon}</span><b>{app.label}</b></button>)}
          </div>
        </div>
        <div className="app-findings">
          <span>{inspectedApps.length}/2 INVESTIGAÇÕES USADAS</span>
          {inspectedApps.length === 0 && <p>Escolha com cuidado. Nem todo aplicativo contém algo útil.</p>}
          {inspectedApps.includes('security') && <article><b>SEGURANÇA</b><p>23:44 — o log da rede associa a abertura do link ao dispositivo de <strong>{getCharacter(session.thiefId).name}</strong>.</p></article>}
          {inspectedApps.includes('mail') && <article><b>E-MAIL</b><p>23:46 — novo login via Chrome/Windows, localização desconhecida. A sessão ainda está ativa.</p></article>}
          {inspectedApps.includes('messages') && <article><b>MENSAGENS</b><p>23:55 — a administração real confirma: “Não enviamos atualização de acesso hoje.”</p></article>}
          {inspectedApps.includes('files') && <article className="is-empty"><b>ARQUIVOS</b><p>Nenhum arquivo recente relacionado ao caso. Você gastou uma oportunidade sem conseguir uma pista forte.</p></article>}
        </div>
      </div>
      <button className="story-primary" disabled={inspectedApps.length !== 2} type="button" onClick={() => setScreen('vote')}>Convocar votação</button>
    </section>}

    {screen === 'vote' && <section className="scene scene-vote">
      <div className="scene-label">23:58 // VOTAÇÃO FINAL</div>
      <h1>Quem está manipulando a investigação?</h1>
      <p className="scene-intro">Os bots votarão usando somente o que cada um sabe: personalidade, memória, pista privada e evidências públicas. Eles não recebem o mapa de papéis.</p>
      <div className="evidence-board">
        <strong>QUADRO DE EVIDÊNCIAS</strong>
        <ul>
          <li>A mensagem usa urgência e um domínio fora do canal oficial.</li>
          <li>O link foi aberto às 23:44; o login desconhecido ocorreu às 23:46.</li>
          {publicClues.map((clue) => <li key={clue.id}>{clue.text}</li>)}
        </ul>
      </div>
      <div className="suspect-grid">
        {characters.filter((character) => character.id !== humanId).map((character) => <button type="button" key={character.id} className={vote === character.id ? 'is-selected' : ''} onClick={() => setVote(character.id)}><Avatar id={character.id}/><b>{character.name}</b><small>{character.archetype}</small><span>{vote === character.id ? 'SEU VOTO' : 'ACUSAR'}</span></button>)}
      </div>
      <button className="story-primary danger-action" disabled={!vote} type="button" onClick={finishVote}>Encerrar votação</button>
    </section>}

    {screen === 'ending' && result && <section className="scene scene-ending">
      <div className="scene-label">00:00 // RESULTADO</div>
      <div className={`ending-banner${result.thiefCaught ? ' is-good' : ' is-bad'}`}>
        <span>{result.thiefCaught ? 'LADRÃO IDENTIFICADO' : 'CASO NÃO RESOLVIDO'}</span>
        <h1>{result.thiefCaught ? `${getCharacter(session.thiefId).name} foi descoberto.` : `${getCharacter(result.accusedId).name} foi acusado. Era a pessoa errada.`}</h1>
        <p>{result.thiefCaught ? 'As evidências e as contradições foram suficientes para a maioria.' : `${getCharacter(session.thiefId).name} permaneceu no grupo. Um novo dispositivo acaba de aparecer na rede do condomínio.`}</p>
      </div>
      <div className="vote-board">
        <h2>Como cada um votou</h2>
        {result.votes.map((item) => <div key={item.voter}><span><Avatar id={item.voter} small/>{getCharacter(item.voter).name}</span><b>→ {getCharacter(item.target).name}</b></div>)}
      </div>
      <div className="role-reveal-grid">
        {session.seats.map((seat) => <article key={seat.characterId}><Avatar id={seat.characterId}/><b>{getCharacter(seat.characterId).name}</b><span>{roleLabels[seat.role]}</span><small>{seat.controller === 'human' ? 'HUMANO' : 'BOT'}</small></article>)}
      </div>
      <div className="learning-recap">
        <span>O QUE ESTE CASO ESCONDEU NA HISTÓRIA</span>
        <p>HTTPS não comprova identidade. Pressão de tempo é uma técnica comum de engenharia social. Domínio, canal oficial, histórico da conversa e registros de acesso precisam ser cruzados antes de confiar.</p>
      </div>
      <button className="story-primary" type="button" onClick={() => setScreen('lobby')}>Jogar novamente · novos papéis</button>
    </section>}
  </main>;
}
