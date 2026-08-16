'use client';

import { useState } from 'react';
import { firstKidsStory, kids, redFlags, safeSteps, type KidId } from '@/src/game/kidsStory';

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

  const selectedKid = kids.find(kid => kid.id === player)!;
  const correctFlags = flags.filter(id => redFlags.find(flag => flag.id === id)?.correct).length;
  const clueSuccess = correctFlags === 2 && !flags.includes('lock');
  const actionSafe = action === 'official' || action === 'adult';
  const teamDone = domain === 'real' && helper === 'adult';
  const shieldDone = shieldSteps.length === safeSteps.length;

  function begin() {
    setScreen('choose');
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
    return <main className="kids-game">
      <section className="kids-panel kids-character-select">
        <div className="kids-step-tag">ESCOLHA SEU HERÓI</div>
        <h1>Quem vai com você?</h1>
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
        <button className="kids-primary" type="button" onClick={() => setScreen('intro')}>Começar →</button>
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

    {screen === 'intro' && <section className="kids-scene">
      <div className="kids-art-card">
        <img src={firstKidsStory.scenes.message} alt="A turma observa uma mensagem suspeita do Clube Aurora" />
      </div>
      <div className="kids-caption-card">
        <span className="kids-step-tag">MISSÃO 1</span>
        <h1>Mensagem estranha!</h1>
        <p>Ajude Luna antes do clique.</p>
        <button className="kids-primary" type="button" onClick={() => setScreen('clues')}>Ver pistas 🔎</button>
      </div>
    </section>}

    {screen === 'clues' && <section className="kids-scene">
      <div className="kids-art-card"><img src={firstKidsStory.scenes.clues} alt="Quadro colorido com pistas sobre a mensagem" /></div>
      <div className="kids-caption-card">
        <span className="kids-step-tag">DESAFIO VISUAL</span>
        <h1>Ache 2 alertas!</h1>
        <div className="kids-choice-grid compact">
          {redFlags.map(flag => <ChoiceCard key={flag.id} icon={flag.icon} title={flag.label} selected={flags.includes(flag.id)} onClick={() => toggleFlag(flag.id)} />)}
        </div>
        {!flagsChecked && <button className="kids-primary" type="button" disabled={flags.length !== 2} onClick={() => setFlagsChecked(true)}>Conferir</button>}
        {flagsChecked && <div className={`kids-feedback ${clueSuccess ? 'good' : 'hint'}`}>
          <b>{clueSuccess ? 'Você achou! ⭐' : 'Olhe de novo! 👀'}</b>
          <p>{clueSuccess ? 'Pressa + endereço estranho = pare e confira.' : 'Cadeado sozinho não prova que o site é verdadeiro.'}</p>
          {!clueSuccess && <button type="button" onClick={() => { setFlags([]); setFlagsChecked(false); }}>Tentar outra vez</button>}
        </div>}
        {flagsChecked && clueSuccess && <button className="kids-primary" type="button" onClick={() => setScreen('https')}>Próxima pista →</button>}
      </div>
    </section>}

    {screen === 'https' && <section className="kids-scene kids-centered-scene">
      <div className="kids-character-lesson">
        <img src="/game/assets/characters/theo.png" alt="Theo mostra uma pista sobre o cadeado" />
        <div className="kids-big-symbol" aria-hidden="true">🔒</div>
        <small>PISTA DO THEO</small>
      </div>
      <div className="kids-caption-card wide">
        <span className="kids-step-tag">PEGADINHA DIGITAL</span>
        <h1>Cadeado = site verdadeiro?</h1>
        <div className="kids-choice-grid two">
          <ChoiceCard icon="✅" title="Sim" selected={httpsAnswer === 'yes'} onClick={() => setHttpsAnswer('yes')} />
          <ChoiceCard icon="🧐" title="Não" selected={httpsAnswer === 'no'} onClick={() => setHttpsAnswer('no')} />
        </div>
        {httpsAnswer && <div className={`kids-feedback ${httpsAnswer === 'no' ? 'good' : 'hint'}`}>
          <b>{httpsAnswer === 'no' ? 'Isso! 🎉' : 'Pegadinha!'}</b>
          <p>Site falso também pode ter cadeado.</p>
        </div>}
        {httpsAnswer && <button className="kids-primary" type="button" onClick={() => setScreen('action')}>Continuar →</button>}
      </div>
    </section>}

    {screen === 'action' && <section className="kids-scene kids-centered-scene">
      <div className="kids-character-moment">
        <img src="/game/assets/characters/nina.png" alt="Nina" />
        <div className="kids-speech"><b>Nina:</b><span>“Vamos pelo caminho seguro!”</span></div>
      </div>
      <div className="kids-caption-card wide">
        <span className="kids-step-tag">SUA DECISÃO</span>
        <h1>O que você faz?</h1>
        <div className="kids-choice-grid three">
          <ChoiceCard icon="👆" title="Clicar no link" selected={action === 'click'} onClick={() => setAction('click')} />
          <ChoiceCard icon="📱" title="Abrir o app" selected={action === 'official'} onClick={() => setAction('official')} />
          <ChoiceCard icon="🤝" title="Pedir ajuda" selected={action === 'adult'} onClick={() => setAction('adult')} />
        </div>
        {action && <div className={`kids-feedback ${actionSafe ? 'good' : 'hint'}`}>
          <b>{actionSafe ? 'Boa escolha! 🛡️' : 'Pare! ✋'}</b>
          <p>{actionSafe ? 'Confira no app oficial ou peça ajuda.' : 'Não clique. Confira por outro caminho.'}</p>
        </div>}
        {action && actionSafe && <button className="kids-primary" type="button" onClick={() => setScreen('team')}>Juntar pistas →</button>}
      </div>
    </section>}

    {screen === 'team' && <section className="kids-panel kids-coop-panel">
      <div className="kids-team-helpers" aria-hidden="true">
        <img src="/game/assets/characters/maya.png" alt="" />
        <img src="/game/assets/characters/caio.png" alt="" />
      </div>
      <span className="kids-step-tag">MISSÃO DA TURMA</span>
      <h1>Junte as 2 pistas!</h1>
      <p className="kids-short-copy">Descubra o site certo e quem pode ajudar.</p>
      <div className="kids-coop-grid">
        <article>
          <div className="kids-player-label">PISTA A 🌐</div>
          <h2>Qual é o site oficial?</h2>
          <button className={domain === 'real' ? 'is-selected' : ''} type="button" onClick={() => setDomain('real')}>clubeaurora.com.br</button>
          <button className={domain === 'fake' ? 'is-selected wrong' : ''} type="button" onClick={() => setDomain('fake')}>aurora-acesso-seguro.net</button>
        </article>
        <article>
          <div className="kids-player-label">PISTA B 💬</div>
          <h2>Quem pode ajudar?</h2>
          <button className={helper === 'adult' ? 'is-selected' : ''} type="button" onClick={() => setHelper('adult')}>Um adulto de confiança</button>
          <button className={helper === 'sender' ? 'is-selected wrong' : ''} type="button" onClick={() => setHelper('sender')}>O número desconhecido</button>
        </article>
      </div>
      {(domain || helper) && !teamDone && <p className="kids-coop-hint">💡 Use o caminho conhecido e alguém de confiança.</p>}
      <button className="kids-primary" type="button" disabled={!teamDone} onClick={() => setScreen('shield')}>Montar escudo ✨</button>
    </section>}

    {screen === 'shield' && <section className="kids-panel kids-shield-panel">
      <div className="kids-big-symbol shield" aria-hidden="true">🛡️</div>
      <div className="kids-shield-helpers" aria-hidden="true">
        <img src="/game/assets/characters/luna.png" alt="" />
      </div>
      <span className="kids-step-tag">ESCUDO CONTROOLS</span>
      <h1>Monte seu escudo!</h1>
      <p className="kids-short-copy">Toque nos 3 superpoderes.</p>
      <div className="kids-safe-steps">
        {safeSteps.map(step => {
          const selected = shieldSteps.includes(step.id);
          return <button key={step.id} type="button" className={selected ? 'is-selected' : ''} onClick={() => setShieldSteps(current => current.includes(step.id) ? current : [...current, step.id])}>
            <span>{step.icon}</span><b>{step.label}</b><i>{selected ? '✓' : '+'}</i>
          </button>;
        })}
      </div>
      <button className="kids-primary" type="button" disabled={!shieldDone} onClick={() => setScreen('ending')}>Missão cumprida! ⭐</button>
    </section>}

    {screen === 'ending' && <section className="kids-ending">
      <img src={firstKidsStory.scenes.team} alt="A turma oficial do CONTROOLS" />
      <div className="kids-ending-card">
        <div className="kids-stars" aria-label="3 estrelas">★ ★ ★</div>
        <span className="kids-step-tag">MISSÃO CUMPRIDA</span>
        <h1>Você conseguiu!</h1>
        <p><b>Parar. Conferir. Pedir ajuda.</b><br />Esse é o superpoder digital!</p>
        <div className="kids-badges"><span>🔎<b>Olho atento</b></span><span>🛡️<b>Escudo digital</b></span><span>⭐<b>Guardião</b></span></div>
        <button className="kids-primary" type="button" onClick={restart}>Jogar de novo</button>
      </div>
    </section>}
  </main>;
}
