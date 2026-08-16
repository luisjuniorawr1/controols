'use client';

import { useMemo, useState } from 'react';
import { firstKidsStory, kids, redFlags, safeSteps, type KidId } from '@/src/game/kidsStory';

type Screen = 'home' | 'choose' | 'intro' | 'clues' | 'https' | 'action' | 'coop' | 'shield' | 'ending';
type PlayerCount = 1 | 2;

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
  const order: Screen[] = ['intro', 'clues', 'https', 'action', 'coop', 'shield', 'ending'];
  const current = Math.max(0, order.indexOf(screen));
  return <div className="kid-progress" aria-label={`Parte ${current + 1} de ${order.length}`}>
    <span style={{ width: `${((current + 1) / order.length) * 100}%` }} />
  </div>;
}

export default function KidsStoryPrototype() {
  const [screen, setScreen] = useState<Screen>('home');
  const [playerCount, setPlayerCount] = useState<PlayerCount>(1);
  const [players, setPlayers] = useState<KidId[]>(['luna']);
  const [flags, setFlags] = useState<string[]>([]);
  const [flagsChecked, setFlagsChecked] = useState(false);
  const [httpsAnswer, setHttpsAnswer] = useState<'yes' | 'no' | null>(null);
  const [action, setAction] = useState<'click' | 'official' | 'adult' | null>(null);
  const [domain, setDomain] = useState<'real' | 'fake' | null>(null);
  const [helper, setHelper] = useState<'adult' | 'sender' | null>(null);
  const [shieldSteps, setShieldSteps] = useState<string[]>([]);

  const selectedKids = useMemo(() => players.map(id => kids.find(kid => kid.id === id)!).filter(Boolean), [players]);
  const correctFlags = flags.filter(id => redFlags.find(flag => flag.id === id)?.correct).length;
  const clueSuccess = correctFlags === 2 && !flags.includes('lock');
  const actionSafe = action === 'official' || action === 'adult';
  const coopDone = domain === 'real' && helper === 'adult';
  const shieldDone = shieldSteps.length === safeSteps.length;

  function begin(count: PlayerCount) {
    setPlayerCount(count);
    setPlayers(count === 1 ? ['luna'] : ['luna', 'theo']);
    setScreen('choose');
  }

  function togglePlayer(id: KidId) {
    setPlayers(current => {
      if (current.includes(id)) {
        if (current.length === 1) return current;
        return current.filter(item => item !== id);
      }
      if (current.length >= playerCount) return [...current.slice(1), id];
      return [...current, id];
    });
  }

  function toggleFlag(id: string) {
    if (flagsChecked) return;
    setFlags(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 2 ? [...current, id] : current);
  }

  function restart() {
    setScreen('home');
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
          <div className="kids-mode-buttons">
            <button type="button" onClick={() => begin(1)}><span>👤</span><b>1 jogador</b></button>
            <button type="button" onClick={() => begin(2)}><span>👥</span><b>2 jogadores</b></button>
          </div>
          <p>Juntos, vocês ajudam a turma a tomar boas decisões na internet.</p>
        </div>
      </section>
    </main>;
  }

  if (screen === 'choose') {
    return <main className="kids-game">
      <section className="kids-panel kids-character-select">
        <div className="kids-step-tag">ESCOLHA SEU PERSONAGEM</div>
        <h1>{playerCount === 1 ? 'Quem vai entrar na aventura?' : 'Escolham dois amigos para jogar'}</h1>
        <div className="kids-character-grid" data-testid="character-grid">
          {kids.map(kid => {
            const selected = players.includes(kid.id);
            return <button key={kid.id} type="button" className={`kids-character-card${selected ? ' is-selected' : ''}`} onClick={() => togglePlayer(kid.id)} style={{ '--kid-color': kid.color } as React.CSSProperties}>
              <img src={kid.asset} alt={kid.name} />
              <div><strong>{kid.name}</strong><span>{kid.trait}</span></div>
              <i aria-hidden="true">{selected ? '✓' : '+'}</i>
            </button>;
          })}
        </div>
        <button className="kids-primary" type="button" disabled={players.length !== playerCount} onClick={() => setScreen('intro')}>Começar aventura →</button>
      </section>
    </main>;
  }

  return <main className="kids-game kids-story">
    <header className="kids-topbar">
      <b>CONTROOLS</b>
      <span>Caso {firstKidsStory.number} · {firstKidsStory.title}</span>
      <div className="kids-player-dots">{selectedKids.map(kid => <img key={kid.id} src={kid.asset} alt="" />)}</div>
    </header>
    <Progress screen={screen} />

    {screen === 'intro' && <section className="kids-scene">
      <div className="kids-art-card">
        <img src={firstKidsStory.scenes.message} alt="A turma observa uma mensagem suspeita do Clube Aurora" />
      </div>
      <div className="kids-caption-card">
        <span className="kids-step-tag">MISSÃO 1</span>
        <h1>Algo está estranho nessa mensagem…</h1>
        <p>Ajude Luna antes que ela toque no botão.</p>
        <button className="kids-primary" type="button" onClick={() => setScreen('clues')}>Procurar pistas 🔎</button>
      </div>
    </section>}

    {screen === 'clues' && <section className="kids-scene">
      <div className="kids-art-card"><img src={firstKidsStory.scenes.clues} alt="Quadro colorido com pistas sobre a mensagem" /></div>
      <div className="kids-caption-card">
        <span className="kids-step-tag">DESAFIO VISUAL</span>
        <h1>Escolha 2 sinais de alerta</h1>
        <div className="kids-choice-grid compact">
          {redFlags.map(flag => <ChoiceCard key={flag.id} icon={flag.icon} title={flag.label} selected={flags.includes(flag.id)} onClick={() => toggleFlag(flag.id)} />)}
        </div>
        {!flagsChecked && <button className="kids-primary" type="button" disabled={flags.length !== 2} onClick={() => setFlagsChecked(true)}>Conferir pistas</button>}
        {flagsChecked && <div className={`kids-feedback ${clueSuccess ? 'good' : 'hint'}`}>
          <b>{clueSuccess ? 'Boa investigação! ⭐' : 'Quase! Olhe de novo 👀'}</b>
          <p>{clueSuccess ? 'Pressa, endereço estranho e remetente desconhecido são ótimos sinais para parar e conferir.' : 'O cadeado protege a conexão, mas não prova que a pessoa ou o site são verdadeiros.'}</p>
          {!clueSuccess && <button type="button" onClick={() => { setFlags([]); setFlagsChecked(false); }}>Tentar outra vez</button>}
        </div>}
        {flagsChecked && clueSuccess && <button className="kids-primary" type="button" onClick={() => setScreen('https')}>Próxima pista →</button>}
      </div>
    </section>}

    {screen === 'https' && <section className="kids-scene kids-centered-scene">
      <div className="kids-big-symbol" aria-hidden="true">🔒</div>
      <div className="kids-caption-card wide">
        <span className="kids-step-tag">PISTA DO THEO</span>
        <h1>O cadeado quer dizer que o site é verdadeiro?</h1>
        <div className="kids-choice-grid two">
          <ChoiceCard icon="✅" title="Sim" selected={httpsAnswer === 'yes'} onClick={() => setHttpsAnswer('yes')} />
          <ChoiceCard icon="🧐" title="Não" selected={httpsAnswer === 'no'} onClick={() => setHttpsAnswer('no')} />
        </div>
        {httpsAnswer && <div className={`kids-feedback ${httpsAnswer === 'no' ? 'good' : 'hint'}`}>
          <b>{httpsAnswer === 'no' ? 'Isso! 🎉' : 'Tem uma pegadinha aqui!'}</b>
          <p>Um site falso também pode ter cadeado. O melhor é entrar pelo aplicativo ou endereço oficial.</p>
        </div>}
        {httpsAnswer && <button className="kids-primary" type="button" onClick={() => setScreen('action')}>O que fazemos agora?</button>}
      </div>
    </section>}

    {screen === 'action' && <section className="kids-scene kids-centered-scene">
      <div className="kids-character-moment">
        <img src="/game/assets/characters/nina.png" alt="Nina" />
        <div className="kids-speech"><b>Nina:</b><span>“Vamos escolher o caminho mais seguro!”</span></div>
      </div>
      <div className="kids-caption-card wide">
        <span className="kids-step-tag">DECISÃO</span>
        <h1>Como vocês ajudam Luna?</h1>
        <div className="kids-choice-grid three">
          <ChoiceCard icon="👆" title="Tocar no link" selected={action === 'click'} onClick={() => setAction('click')} />
          <ChoiceCard icon="📱" title="Abrir o app oficial" selected={action === 'official'} onClick={() => setAction('official')} />
          <ChoiceCard icon="🤝" title="Pedir ajuda" selected={action === 'adult'} onClick={() => setAction('adult')} />
        </div>
        {action && <div className={`kids-feedback ${actionSafe ? 'good' : 'hint'}`}>
          <b>{actionSafe ? 'Boa escolha! 🛡️' : 'Melhor não clicar ainda.'}</b>
          <p>{actionSafe ? 'Quando uma mensagem assusta ou apressa, vale sair dela e conferir por um caminho conhecido.' : 'Se a mensagem for falsa, o botão pode levar para uma armadilha. Vamos conferir por outro caminho.'}</p>
        </div>}
        {action && actionSafe && <button className="kids-primary" type="button" onClick={() => setScreen('coop')}>Missão em equipe →</button>}
      </div>
    </section>}

    {screen === 'coop' && <section className="kids-panel kids-coop-panel">
      <span className="kids-step-tag">MISSÃO EM EQUIPE</span>
      <h1>{playerCount === 2 ? 'Cada jogador resolve uma parte' : 'Resolva as duas partes'}</h1>
      <p className="kids-short-copy">Juntem as duas pistas para confirmar o caminho seguro.</p>
      <div className="kids-coop-grid">
        <article>
          <div className="kids-player-label">{playerCount === 2 ? `${selectedKids[0]?.name} · PISTA A` : 'PISTA A'}</div>
          <div className="kids-coop-icon">🌐</div>
          <h2>Qual parece ser o endereço oficial?</h2>
          <button className={domain === 'real' ? 'is-selected' : ''} type="button" onClick={() => setDomain('real')}>clubeaurora.com.br</button>
          <button className={domain === 'fake' ? 'is-selected wrong' : ''} type="button" onClick={() => setDomain('fake')}>aurora-acesso-seguro.net</button>
        </article>
        <article>
          <div className="kids-player-label">{playerCount === 2 ? `${selectedKids[1]?.name} · PISTA B` : 'PISTA B'}</div>
          <div className="kids-coop-icon">💬</div>
          <h2>Quem pode ajudar a conferir?</h2>
          <button className={helper === 'adult' ? 'is-selected' : ''} type="button" onClick={() => setHelper('adult')}>Um adulto de confiança</button>
          <button className={helper === 'sender' ? 'is-selected wrong' : ''} type="button" onClick={() => setHelper('sender')}>O número desconhecido</button>
        </article>
      </div>
      {(domain || helper) && !coopDone && <p className="kids-coop-hint">💡 Procurem o caminho conhecido e uma pessoa em quem vocês já confiam.</p>}
      <button className="kids-primary" type="button" disabled={!coopDone} onClick={() => setScreen('shield')}>Juntar as pistas ✨</button>
    </section>}

    {screen === 'shield' && <section className="kids-panel kids-shield-panel">
      <div className="kids-big-symbol shield" aria-hidden="true">🛡️</div>
      <span className="kids-step-tag">ESCUDO CONTROOLS</span>
      <h1>Monte o escudo da internet segura</h1>
      <p className="kids-short-copy">Toque nos 3 passos que vocês aprenderam.</p>
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
        <h1>Vocês protegeram Luna!</h1>
        <p>Agora a turma sabe: <b>parar, conferir e pedir ajuda</b> é um superpoder digital.</p>
        <div className="kids-badges"><span>🔎<b>Olho de Detetive</b></span><span>🛡️<b>Escudo Digital</b></span><span>🤝<b>Time Unido</b></span></div>
        <button className="kids-primary" type="button" onClick={restart}>Jogar de novo</button>
      </div>
    </section>}
  </main>;
}
