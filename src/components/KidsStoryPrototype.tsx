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

function SceneArt({ src, alt }: { src: string; alt: string }) {
  return <img className="kids-scene-v2-art" src={src} alt={alt} />;
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
  const [observationUnlocked, setObservationUnlocked] = useState(false);

  const selectedKid = kids.find(kid => kid.id === player)!;
  const correctFlags = flags.filter(id => redFlags.find(flag => flag.id === id)?.correct).length;
  const clueSuccess = correctFlags === 2 && !flags.includes('lock');
  const actionSafe = action === 'official' || action === 'adult';
  const teamDone = domain === 'real' && helper === 'adult';
  const shieldDone = shieldSteps.length === safeSteps.length;
  const observationTip = useMemo(() => {
    const elapsed = OBSERVATION_SECONDS - observationSeconds;
    const index = Math.min(observationTips.length - 1, Math.floor(elapsed / 8));
    return observationTips[index];
  }, [observationSeconds]);

  useEffect(() => {
    if (screen !== 'intro' || observationUnlocked) return;

    const ticker = window.setInterval(() => {
      setObservationSeconds(current => current > 1 ? current - 1 : current);
    }, 1000);

    const unlockTimer = window.setTimeout(() => {
      setObservationSeconds(0);
      setObservationUnlocked(true);
    }, OBSERVATION_SECONDS * 1000);

    return () => {
      window.clearInterval(ticker);
      window.clearTimeout(unlockTimer);
    };
  }, [screen, observationUnlocked]);

  function startStory() {
    setObservationSeconds(OBSERVATION_SECONDS);
    setObservationUnlocked(false);
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
    setObservationUnlocked(false);
  }

  if (screen === 'home') {
    return <main className="kids-game kids-home kids-home-v2">
      <section className="kids-home-v2-stage">
        <SceneArt src={firstKidsStory.scenes.title} alt="Sala de aventuras do CONTROOLS" />
        <div className="kids-home-v2-ui">
          <span className="kids-age">{firstKidsStory.age}</span>
          <h1>CONTROOLS</h1>
          <h2>A Mensagem Misteriosa</h2>
          <p>Observe. Pense. Proteja.</p>
          <button className="kids-primary" type="button" onClick={() => setScreen('choose')}>Jogar ▶</button>
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

  return <main className="kids-game kids-story kids-story-v2">
    <header className="kids-topbar">
      <b>CONTROOLS</b>
      <span>Caso {firstKidsStory.number} · {firstKidsStory.title}</span>
      <div className="kids-player-dots"><img src={selectedKid.asset} alt="" /></div>
    </header>
    <Progress screen={screen} />

    {screen === 'intro' && <section className="kids-scene-v2 scene-intro" data-screen="intro">
      <SceneArt src={firstKidsStory.scenes.message} alt="Mensagem suspeita do Clube Aurora pedindo atualização antes das 20h" />
      <div className="kids-scene-v2-ui ui-right kids-observation-ui">
        <span className="kids-step-tag">MISSÃO 1</span>
        <h1>Olhe com atenção!</h1>
        <p>Tem pistas escondidas nessa mensagem.</p>
        <div className={`kids-v2-timer${observationUnlocked ? ' is-ready' : ''}`} aria-live="polite">
          <small>{observationUnlocked ? 'PRONTO!' : 'TEMPO DE DETETIVE'}</small>
          <strong>{observationUnlocked ? '✓' : observationSeconds}</strong>
          <span>{observationUnlocked ? 'VAMOS INVESTIGAR' : 'SEGUNDOS'}</span>
        </div>
        <div className="kids-v2-tip" aria-live="polite">🔎 <b>{observationTip}</b></div>
        <button className="kids-primary" type="button" disabled={!observationUnlocked} onClick={() => setScreen('clues')}>
          {observationUnlocked ? 'Ver pistas 🔎' : '🔒 Observe primeiro'}
        </button>
      </div>
    </section>}

    {screen === 'clues' && <section className="kids-scene-v2 scene-clues" data-screen="clues">
      <SceneArt src={firstKidsStory.scenes.clues} alt="Quadro colorido com pistas sobre a mensagem" />
      <div className="kids-scene-v2-ui ui-right compact-ui">
        <span className="kids-step-tag">DESAFIO VISUAL</span>
        <h1>Escolha 2 pistas!</h1>
        <p className="kids-v2-dialogue">Maya: “Tem sinais estranhos aqui!”</p>
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

    {screen === 'https' && <section className="kids-scene-v2 scene-https" data-screen="https">
      <SceneArt src={firstKidsStory.scenes.https} alt="Theo com cadeado e navegador em uma cena de segurança digital" />
      <div className="kids-scene-v2-ui ui-right">
        <span className="kids-step-tag">PEGADINHA DIGITAL</span>
        <p className="kids-v2-dialogue">Theo: “Só o cadeado não basta!”</p>
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

    {screen === 'action' && <section className="kids-scene-v2 scene-action" data-screen="action">
      <SceneArt src={firstKidsStory.scenes.action} alt="Nina apresenta três escolhas para decidir o caminho mais seguro" />
      <div className="kids-scene-v2-ui ui-bottom wide-ui">
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

    {screen === 'team' && <section className="kids-scene-v2 scene-team" data-screen="team">
      <SceneArt src={firstKidsStory.scenes.team} alt="Maya e Caio juntam as respostas: site oficial e adulto de confiança" />
      <div className="kids-scene-v2-ui ui-bottom wide-ui team-ui" data-testid="team-guide-stage">
        <span className="kids-step-tag">DESAFIO DAS PISTAS</span>
        <h1>Junte as 2 respostas!</h1>
        <div className="kids-clue-pair">
          <article className="kids-clue-block">
            <div className="kids-player-label">PISTA A</div>
            <h2>Qual parece oficial?</h2>
            <button className={domain === 'real' ? 'is-selected' : ''} type="button" onClick={() => setDomain('real')}>clubeaurora.com.br</button>
            <button className={domain === 'fake' ? 'is-selected wrong' : ''} type="button" onClick={() => setDomain('fake')}>aurora-acesso-seguro.net</button>
          </article>
          <article className="kids-clue-block">
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

    {screen === 'shield' && <section className="kids-scene-v2 scene-shield" data-screen="shield">
      <SceneArt src={firstKidsStory.scenes.shield} alt="Luna e a turma montam um escudo digital com três atitudes seguras" />
      <div className="kids-scene-v2-ui ui-right compact-ui">
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

    {screen === 'ending' && <section className="kids-scene-v2 scene-ending" data-screen="ending">
      <SceneArt src={firstKidsStory.scenes.ending} alt="Turma do CONTROOLS comemora o final da missão" />
      <div className="kids-scene-v2-ui ui-bottom ending-ui">
        <span className="kids-step-tag">MISSÃO CUMPRIDA</span>
        <h1>Você conseguiu!</h1>
        <p><b>Parou. Pensou. Confirmou.</b></p>
        <div className="kids-badges"><span>🔎<b>Olho de lince</b></span><span>🛡️<b>Pensou antes</b></span><span>⭐<b>Guardião digital</b></span></div>
        <button className="kids-primary" type="button" onClick={restart}>Jogar de novo</button>
      </div>
    </section>}
  </main>;
}
