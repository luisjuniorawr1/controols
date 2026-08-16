'use client';

import { useEffect, useMemo, useState } from 'react';
import { firstKidsStory, kids, redFlags, safeSteps, type KidId } from '@/src/game/kidsStory';

const OBSERVATION_SECONDS = 30;
const observationTips = [
  'Olhe a imagem inteira.',
  'Veja o link com atenção.',
  'Quem mandou essa mensagem?',
  'Por que existe tanta pressa?',
];

type Screen = 'home' | 'choose' | 'intro' | 'clues' | 'https' | 'action' | 'team' | 'shield' | 'ending';

type ChoiceCardProps = {
  icon: string;
  title: string;
  selected?: boolean;
  onClick: () => void;
};

type GuideStageProps = {
  kidId: KidId;
  icon: string;
  kicker: string;
  line: string;
  tone: 'blue' | 'green' | 'yellow';
  alt: string;
  testId: string;
};

function ChoiceCard({ icon, title, selected, onClick }: ChoiceCardProps) {
  return <button type="button" className={`kid-choice${selected ? ' is-selected' : ''}`} onClick={onClick}>
    <span className="kid-choice-icon" aria-hidden="true">{icon}</span>
    <strong>{title}</strong>
  </button>;
}

function Progress({ screen }: { screen: Screen }) {
  const order: Screen[] = ['intro', 'clues', 'https', 'action', 'team', 'shield', 'ending'];
  const current = Math.max(0, order.indexOf(screen));
  return <div className="kid-progress" aria-label={`Parte ${current + 1} de ${order.length}`}>
    <span style={{ width: `${((current + 1) / order.length) * 100}%` }} />
  </div>;
}

function GuideStage({ kidId, icon, kicker, line, tone, alt, testId }: GuideStageProps) {
  const kid = kids.find(item => item.id === kidId)!;
  return <aside className={`kids-visual-stage kids-tone-${tone}`} data-testid={`${testId}-stage`}>
    <div className="kids-guide-copy">
      <span>{kicker}</span>
      <b>{line}</b>
    </div>
    <div className="kids-guide-icon" aria-hidden="true">{icon}</div>
    <span className="kids-scene-spark is-one" aria-hidden="true">✦</span>
    <span className="kids-scene-spark is-two" aria-hidden="true">●</span>
    <img data-testid={testId} src={kid.asset} alt={alt} />
  </aside>;
}

function DuoGuideStage() {
  const maya = kids.find(item => item.id === 'maya')!;
  const caio = kids.find(item => item.id === 'caio')!;
  return <aside className="kids-duo-stage" data-testid="team-guide-stage">
    <div className="kids-duo-title"><span>DUAS PISTAS</span><b>Junte as peças!</b></div>
    <div className="kids-duo-callout is-left">🌐 SITE CERTO</div>
    <div className="kids-duo-callout is-right">🤝 PESSOA CERTA</div>
    <div className="kids-duo-characters">
      <img data-testid="maya-guide" src={maya.asset} alt="Maya ajuda a encontrar o site certo" />
      <img data-testid="caio-guide" src={caio.asset} alt="Caio ajuda a escolher uma pessoa de confiança" />
    </div>
  </aside>;
}

export default function KidsStoryPrototype() {
  const [screen, setScreen] = useState<Screen>('home');
  const [player, setPlayer] = useState<KidId>('luna');
  const [flags, setFlags] = useState<string[]>([]);
  const [flagsChecked, setFlagsChecked] = useState(false);
  const [httpsAnswer, setHttpsAnswer] = useState<'yes' | 'no' | null>(null);
  const [action, setAction] = useState<'click' | 'official' | 'adult' | null>(null);
  const [domain, setDomain] = useState<'real' | 'fake' | null>(null);
  const [helper, setHelper] = useState<'adult' | 'sender' | null>(null);
  const [shieldSteps, setShieldSteps] = useState<string[]>([]);
  const [observationSeconds, setObservationSeconds] = useState(OBSERVATION_SECONDS);

  const selectedKid = kids.find(kid => kid.id === player)!;
  const maya = kids.find(kid => kid.id === 'maya')!;
  const correctFlags = flags.filter(id => redFlags.find(flag => flag.id === id)?.correct).length;
  const clueSuccess = correctFlags === 2 && !flags.includes('lock');
  const actionSafe = action === 'official' || action === 'adult';
  const teamDone = domain === 'real' && helper === 'adult';
  const shieldDone = shieldSteps.length === safeSteps.length;
  const observationUnlocked = observationSeconds === 0;
  const observationTip = useMemo(() => {
    const elapsed = OBSERVATION_SECONDS - observationSeconds;
    const index = Math.min(observationTips.length - 1, Math.floor(elapsed / 8));
    return observationTips[index];
  }, [observationSeconds]);

  useEffect(() => {
    if (screen !== 'intro' || observationSeconds <= 0) return;
    const timer = window.setTimeout(() => setObservationSeconds(current => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [screen, observationSeconds]);

  function begin() {
    setScreen('choose');
  }

  function startStory() {
    setObservationSeconds(OBSERVATION_SECONDS);
    setScreen('intro');
  }

  function toggleFlag(id: string) {
    if (flagsChecked) return;
    setFlags(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 2 ? [...current, id] : current);
  }

  function restart() {
    setScreen('home');
    setPlayer('luna');
    setFlags([]);
    setFlagsChecked(false);
    setHttpsAnswer(null);
    setAction(null);
    setDomain(null);
    setHelper(null);
    setShieldSteps([]);
    setObservationSeconds(OBSERVATION_SECONDS);
  }

  if (screen === 'home') {
    return <main className="kids-game kids-home">
      <section className="kids-title-stage">
        <img className="kids-title-art" src={firstKidsStory.scenes.title} alt="Luna, Theo, Maya, Caio e Nina reunidos diante da tela do CONTROOLS" />
        <div className="kids-title-overlay">
          <span className="kids-age">{firstKidsStory.age}</span>
          <div className="kids-mode-buttons" style={{ gridTemplateColumns: 'minmax(260px, 520px)', justifyContent: 'center' }}>
            <button type="button" onClick={begin}><span>▶️</span><b>Jogar</b></button>
          </div>
          <p>Ajude a turma e vire um Guardião Digital!</p>
        </div>
      </section>
    </main>;
  }

  if (screen === 'choose') {
    return <main className="kids-game kids-cast-screen">
      <section className="kids-panel kids-character-select">
        <div className="kids-step-tag">ESCOLHA SEU AMIGO</div>
        <h1>Quem vai ajudar hoje?</h1>
        <div className="kids-character-grid" data-testid="character-grid">
          {kids.map(kid => {
            const selected = player === kid.id;
            return <button key={kid.id} type="button" className={`kids-character-card${selected ? ' is-selected' : ''}`} onClick={() => setPlayer(kid.id)} style={{ '--kid-color': kid.color } as React.CSSProperties}>
              <img src={kid.asset} alt={kid.name} />
              <div><strong>{kid.name}</strong><span>{kid.trait}</span></div>
              <i aria-hidden="true">{selected ? '✓' : '+'}</i>
            </button>;
          })}
        </div>
        <button className="kids-primary" type="button" onClick={startStory}>Começar aventura →</button>
      </section>
    </main>;
  }

  return <main className="kids-game kids-story">
    <header className="kids-topbar">
      <b>CONTROOLS</b>
      <span>Caso {firstKidsStory.number} · {firstKidsStory.title}</span>
      <div className="kids-player-dots"><img src={selectedKid.asset} alt="" /></div>
    </header>
    <Progress screen={screen} />

    {screen === 'intro' && <section className="kids-stage-grid" data-screen="intro">
      <div className="kids-art-stage">
        <img src={firstKidsStory.scenes.message} alt="A turma observa uma mensagem suspeita do Clube Aurora" />
        <div className="kids-art-sticker">📩 MENSAGEM NOVA!</div>
        <div className="kids-art-cue cue-link" aria-hidden="true">🔗</div>
        <div className="kids-art-cue cue-clock" aria-hidden="true">⏰</div>
      </div>
      <div className="kids-game-card kids-observation-card">
        <span className="kids-step-tag">MISSÃO 1</span>
        <h1>Olhe com atenção!</h1>
        <p>Tem pistas escondidas nessa mensagem.</p>
        <div className="kids-observation-zone">
          <div className={`kids-observation-orb${observationUnlocked ? ' is-ready' : ''}`} aria-live="polite">
            <span>{observationUnlocked ? 'PRONTO!' : 'OLHOS DE DETETIVE'}</span>
            <strong>{observationUnlocked ? '✓' : observationSeconds}</strong>
            <small>{observationUnlocked ? 'VAMOS INVESTIGAR' : 'SEGUNDOS'}</small>
          </div>
          <img className="kids-observation-kid" src={selectedKid.asset} alt={`${selectedKid.name} observa a mensagem com atenção`} />
        </div>
        <div className="kids-observation-tip" aria-live="polite"><span>🔎</span><b>{observationTip}</b></div>
        <button className="kids-primary" type="button" disabled={!observationUnlocked} onClick={() => setScreen('clues')}>
          {observationUnlocked ? 'Ver pistas 🔎' : '🔒 Observe primeiro'}
        </button>
      </div>
    </section>}

    {screen === 'clues' && <section className="kids-stage-grid" data-screen="clues">
      <div className="kids-art-stage">
        <img src={firstKidsStory.scenes.clues} alt="Quadro colorido com pistas sobre a mensagem" />
        <div className="kids-art-sticker">🔎 OLHO DE DETETIVE</div>
      </div>
      <div className="kids-game-card kids-clue-game-card">
        <span className="kids-step-tag">DESAFIO VISUAL</span>
        <h1>Escolha 2 pistas!</h1>
        <div className="kids-inline-guide">
          <img src={maya.asset} alt="Maya ajuda a procurar as pistas" />
          <div><small>MAYA DIZ:</small><b>“Tem 2 sinais estranhos aqui!”</b></div>
        </div>
        <div className="kids-choice-grid compact">
          {redFlags.map(flag => <ChoiceCard key={flag.id} icon={flag.icon} title={flag.label} selected={flags.includes(flag.id)} onClick={() => toggleFlag(flag.id)} />)}
        </div>
        <div className="kids-selection-count" aria-live="polite"><b>{flags.length}</b><span>/2 pistas</span></div>
        {!flagsChecked && <button className="kids-primary" type="button" disabled={flags.length !== 2} onClick={() => setFlagsChecked(true)}>Conferir</button>}
        {flagsChecked && <div className={`kids-feedback ${clueSuccess ? 'good' : 'hint'}`}>
          <b>{clueSuccess ? 'Boa investigação! ⭐' : 'Olhe de novo! 👀'}</b>
          <p>{clueSuccess ? 'Pressa + endereço estranho = pare e confira.' : 'Cadeado sozinho não prova que o site é verdadeiro.'}</p>
          {!clueSuccess && <button type="button" onClick={() => { setFlags([]); setFlagsChecked(false); }}>Tentar outra vez</button>}
        </div>}
        {flagsChecked && clueSuccess && <button className="kids-primary" type="button" onClick={() => setScreen('https')}>Próxima missão →</button>}
      </div>
    </section>}

    {screen === 'https' && <section className="kids-stage-grid" data-screen="https">
      <GuideStage
        kidId="theo"
        icon="🔒"
        kicker="DICA DO THEO"
        line="Só o cadeado não basta!"
        tone="blue"
        alt="Theo mostra uma pista sobre o cadeado"
        testId="theo-guide"
      />
      <div className="kids-game-card">
        <span className="kids-step-tag">PEGADINHA DIGITAL</span>
        <div className="kids-visual-equation" aria-hidden="true"><span>🔒</span><b>=</b><span>✅?</span></div>
        <h1>Cadeado = site seguro?</h1>
        <div className="kids-choice-grid two">
          <ChoiceCard icon="✅" title="Sim" selected={httpsAnswer === 'yes'} onClick={() => setHttpsAnswer('yes')} />
          <ChoiceCard icon="🧐" title="Não" selected={httpsAnswer === 'no'} onClick={() => setHttpsAnswer('no')} />
        </div>
        {httpsAnswer && <div className={`kids-feedback ${httpsAnswer === 'no' ? 'good' : 'hint'}`}>
          <b>{httpsAnswer === 'no' ? 'Isso! 🎉' : 'Quase!'}</b>
          <p>Site falso também pode ter cadeado.</p>
        </div>}
        {httpsAnswer && <button className="kids-primary" type="button" onClick={() => setScreen('action')}>Continuar →</button>}
      </div>
    </section>}

    {screen === 'action' && <section className="kids-stage-grid" data-screen="action">
      <GuideStage
        kidId="nina"
        icon="🛡️"
        kicker="DICA DA NINA"
        line="Vamos com calma!"
        tone="green"
        alt="Nina mostra o caminho mais seguro"
        testId="nina-guide"
      />
      <div className="kids-game-card">
        <span className="kids-step-tag">SUA DECISÃO</span>
        <h1>O que fazer agora?</h1>
        <div className="kids-choice-grid three">
          <ChoiceCard icon="👆" title="Clicar agora" selected={action === 'click'} onClick={() => setAction('click')} />
          <ChoiceCard icon="📱" title="Abrir o app" selected={action === 'official'} onClick={() => setAction('official')} />
          <ChoiceCard icon="🤝" title="Pedir ajuda" selected={action === 'adult'} onClick={() => setAction('adult')} />
        </div>
        {action && <div className={`kids-feedback ${actionSafe ? 'good' : 'hint'}`}>
          <b>{actionSafe ? 'Boa escolha! 🛡️' : 'Pense de novo! ✋'}</b>
          <p>{actionSafe ? 'Confira no app oficial ou peça ajuda.' : 'Não clique correndo. Confira por outro caminho.'}</p>
        </div>}
        {action && actionSafe && <button className="kids-primary" type="button" onClick={() => setScreen('team')}>Juntar respostas →</button>}
      </div>
    </section>}

    {screen === 'team' && <section className="kids-stage-grid" data-screen="team">
      <DuoGuideStage />
      <div className="kids-game-card kids-team-card">
        <span className="kids-step-tag">DESAFIO DAS PISTAS</span>
        <h1>Junte as 2 respostas!</h1>
        <div className="kids-clue-pair">
          <article className="kids-clue-block">
            <div className="kids-clue-picture" aria-hidden="true">🌐</div>
            <div className="kids-player-label">PISTA A</div>
            <h2>Qual parece oficial?</h2>
            <button className={domain === 'real' ? 'is-selected' : ''} type="button" onClick={() => setDomain('real')}>clubeaurora.com.br</button>
            <button className={domain === 'fake' ? 'is-selected wrong' : ''} type="button" onClick={() => setDomain('fake')}>aurora-acesso-seguro.net</button>
          </article>
          <article className="kids-clue-block">
            <div className="kids-clue-picture" aria-hidden="true">🤝</div>
            <div className="kids-player-label">PISTA B</div>
            <h2>Quem pode ajudar?</h2>
            <button className={helper === 'adult' ? 'is-selected' : ''} type="button" onClick={() => setHelper('adult')}>Um adulto de confiança</button>
            <button className={helper === 'sender' ? 'is-selected wrong' : ''} type="button" onClick={() => setHelper('sender')}>O número desconhecido</button>
          </article>
        </div>
        {(domain || helper) && !teamDone && <p className="kids-coop-hint">💡 Caminho conhecido + pessoa de confiança.</p>}
        {teamDone && <div className="kids-feedback good kids-team-success"><b>As pistas combinam! ⭐</b></div>}
        <button className="kids-primary" type="button" disabled={!teamDone} onClick={() => setScreen('shield')}>Montar escudo ✨</button>
      </div>
    </section>}

    {screen === 'shield' && <section className="kids-stage-grid" data-screen="shield">
      <GuideStage
        kidId="luna"
        icon="🛡️"
        kicker="SUPERPODERES"
        line="Isso protege você!"
        tone="yellow"
        alt="Luna comemora os superpoderes digitais"
        testId="luna-guide"
      />
      <div className="kids-game-card kids-shield-game-card">
        <span className="kids-step-tag">ESCUDO CONTROOLS</span>
        <h1>Monte seu escudo!</h1>
        <p className="kids-short-copy">Toque nos 3 superpoderes.</p>
        <div className="kids-shield-meter" aria-hidden="true"><span style={{ width: `${(shieldSteps.length / safeSteps.length) * 100}%` }} /></div>
        <div className="kids-safe-steps">
          {safeSteps.map(step => {
            const selected = shieldSteps.includes(step.id);
            return <button key={step.id} type="button" className={selected ? 'is-selected' : ''} onClick={() => setShieldSteps(current => current.includes(step.id) ? current : [...current, step.id])}>
              <span>{step.icon}</span><b>{step.label}</b><i>{selected ? '✓' : '+'}</i>
            </button>;
          })}
        </div>
        {shieldDone && <div className="kids-feedback good"><b>Escudo completo! ✨</b></div>}
        <button className="kids-primary" type="button" disabled={!shieldDone} onClick={() => setScreen('ending')}>Ver resultado ⭐</button>
      </div>
    </section>}

    {screen === 'ending' && <section className="kids-stage-grid" data-screen="ending">
      <div className="kids-finale-art">
        <img src={firstKidsStory.scenes.team} alt="A turma oficial do CONTROOLS comemora a missão" />
        <span className="kids-finale-star is-one" aria-hidden="true">⭐</span>
        <span className="kids-finale-star is-two" aria-hidden="true">✨</span>
        <span className="kids-finale-star is-three" aria-hidden="true">⭐</span>
        <span className="kids-confetti c1" aria-hidden="true">●</span>
        <span className="kids-confetti c2" aria-hidden="true">▲</span>
        <span className="kids-confetti c3" aria-hidden="true">■</span>
      </div>
      <div className="kids-game-card kids-ending-card-v2">
        <div className="kids-card-emoji" aria-hidden="true">🏆</div>
        <span className="kids-step-tag">MISSÃO CUMPRIDA</span>
        <h1>Você conseguiu!</h1>
        <p><b>Parou. Pensou. Confirmou.</b><br />Esse é o superpoder digital!</p>
        <div className="kids-badges"><span>🔎<b>Olho de lince</b></span><span>🛡️<b>Pensou antes</b></span><span>⭐<b>Guardião digital</b></span></div>
        <button className="kids-primary" type="button" onClick={restart}>Jogar de novo</button>
      </div>
    </section>}
  </main>;
}
