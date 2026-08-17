'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  case001Assets,
  case002Assets,
  firstKidsStory,
  kidsGames,
  passwordHabits,
  redFlags,
  safeSteps,
  secondKidsStory,
  type KidsGameId,
} from '@/src/game/kidsStory';

const OBSERVATION_SECONDS = 30;
const observationTips = [
  'Olhe a imagem inteira.',
  'Veja o link com atenção.',
  'Quem mandou essa mensagem?',
  'Por que existe tanta pressa?',
];

type AppMode = 'library' | 'loading' | 'playing';
type Case001Screen = 'intro' | 'clues' | 'https' | 'action' | 'team' | 'shield' | 'ending';
type Case002Screen = 'warning' | 'weak' | 'strong' | 'reuse' | 'code' | 'key' | 'ending';
type GameDefinition = (typeof kidsGames)[number];

type ChoiceProps = {
  icon?: string;
  label: string;
  selected?: boolean;
  wrong?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function Choice({ icon, label, selected, wrong, disabled, onClick }: ChoiceProps) {
  return (
    <button
      type="button"
      className={`kids3-choice${selected ? ' is-selected' : ''}${wrong ? ' is-wrong' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <b>{label}</b>
    </button>
  );
}

function Scene({
  src,
  alt,
  screen,
  caseNumber,
  caseTitle,
  progress,
  children,
  compact = false,
}: {
  src: string;
  alt: string;
  screen: string;
  caseNumber: string;
  caseTitle: string;
  progress: number;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="kids3-scene" data-screen={screen}>
      <img className="kids3-scene-art" src={src} alt={alt} />
      <aside className={`kids3-panel${compact ? ' is-compact' : ''}`}>
        <div className="kids3-panel-meta">
          <span>CASO {caseNumber}</span>
          <small>{caseTitle}</small>
        </div>
        <div className="kids3-progress" aria-label={`Progresso ${progress}%`}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <div className="kids3-panel-body">{children}</div>
      </aside>
    </section>
  );
}

function LoadingCover({ game, assets, onReady }: { game: GameDefinition; assets: readonly string[]; onReady: () => void }) {
  const [loaded, setLoaded] = useState(0);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    setLoaded(0);
    setFailed(false);

    const loadOne = (src: string) => new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        if (active) setLoaded(current => Math.min(assets.length, current + 1));
        resolve();
      };
      image.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
      image.src = src;
      if (image.complete && image.naturalWidth > 0) {
        if (active) setLoaded(current => Math.min(assets.length, current + 1));
        resolve();
      }
    });

    Promise.all(assets.map(loadOne))
      .then(() => {
        if (!active) return;
        timer = window.setTimeout(onReady, 650);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [assets, attempt, onReady]);

  const percent = Math.round((loaded / assets.length) * 100);

  return (
    <section className="kids3-loader" data-screen={`loading-${game.id}`}>
      <img className="kids3-loader-art" src={game.cover} alt={`Capa de ${game.title}`} />
      <div className="kids3-loader-shade" />
      <div className="kids3-loader-card">
        <span>CASO {game.number}</span>
        <h1>{game.title}</h1>
        <p>{failed ? 'Uma imagem não carregou.' : percent === 100 ? 'Missão pronta!' : 'Preparando a missão...'}</p>
        <div className="kids3-loader-bar" aria-label={`Carregamento ${percent}%`}>
          <i style={{ width: `${failed ? 100 : percent}%` }} />
        </div>
        <strong>{failed ? '!' : `${percent}%`}</strong>
        {failed && <button type="button" onClick={() => setAttempt(value => value + 1)}>Tentar novamente</button>}
      </div>
    </section>
  );
}

function GameLibrary({ onChoose }: { onChoose: (id: KidsGameId) => void }) {
  return (
    <section className="kids3-library" data-screen="library">
      <div className="kids3-library-heading">
        <b>CONTROOLS</b>
        <h1>Escolha uma aventura</h1>
        <p>Observe, pense e proteja.</p>
      </div>
      <div className="kids3-game-grid">
        {kidsGames.map((game, index) => (
          <button key={game.id} type="button" className="kids3-game-card" onClick={() => onChoose(game.id)}>
            <img src={game.cover} alt="" />
            <span className="kids3-game-card-shade" />
            <div>
              <small>{index === 1 ? 'NOVO · ' : ''}CASO {game.number}</small>
              <h2>{game.title}</h2>
              <p>{game.subtitle}</p>
              <b>JOGAR ▶</b>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function Case001Game({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Case001Screen>('intro');
  const [flags, setFlags] = useState<string[]>([]);
  const [flagsChecked, setFlagsChecked] = useState(false);
  const [httpsAnswer, setHttpsAnswer] = useState<'yes' | 'no' | null>(null);
  const [action, setAction] = useState<'click' | 'official' | 'adult' | null>(null);
  const [domain, setDomain] = useState<'real' | 'fake' | null>(null);
  const [helper, setHelper] = useState<'adult' | 'sender' | null>(null);
  const [shieldSteps, setShieldSteps] = useState<string[]>([]);
  const [observationSeconds, setObservationSeconds] = useState(OBSERVATION_SECONDS);
  const [observationUnlocked, setObservationUnlocked] = useState(false);

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
    const ticker = window.setInterval(() => setObservationSeconds(current => current > 1 ? current - 1 : current), 1000);
    const unlock = window.setTimeout(() => {
      setObservationSeconds(0);
      setObservationUnlocked(true);
    }, OBSERVATION_SECONDS * 1000);
    return () => {
      window.clearInterval(ticker);
      window.clearTimeout(unlock);
    };
  }, [screen, observationUnlocked]);

  function toggleFlag(id: string) {
    if (flagsChecked) return;
    setFlags(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 2 ? [...current, id] : current);
  }

  function reset() {
    setScreen('intro');
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

  if (screen === 'intro') return (
    <Scene src={firstKidsStory.scenes.message} alt="Luna observa uma mensagem suspeita do Clube Aurora" screen="case001-intro" caseNumber="001" caseTitle={firstKidsStory.title} progress={14}>
      <span className="kids3-tag">MISSÃO 1</span>
      <h1>Olhe com atenção!</h1>
      <p>Tem pistas escondidas nessa mensagem.</p>
      <div className={`kids3-timer${observationUnlocked ? ' is-ready' : ''}`} aria-live="polite">
        <small>{observationUnlocked ? 'PRONTO!' : 'TEMPO DE DETETIVE'}</small>
        <strong>{observationUnlocked ? '✓' : observationSeconds}</strong>
        <span>{observationUnlocked ? 'VAMOS INVESTIGAR' : 'SEGUNDOS'}</span>
      </div>
      <div className="kids3-tip">🔎 <b>{observationTip}</b></div>
      <button className="kids3-primary" type="button" disabled={!observationUnlocked} onClick={() => setScreen('clues')}>
        {observationUnlocked ? 'Ver pistas 🔎' : '🔒 Observe primeiro'}
      </button>
    </Scene>
  );

  if (screen === 'clues') return (
    <Scene src={firstKidsStory.scenes.clues} alt="Maya investiga as pistas da mensagem" screen="case001-clues" caseNumber="001" caseTitle={firstKidsStory.title} progress={28} compact>
      <span className="kids3-tag">DESAFIO VISUAL</span>
      <h1>Escolha 2 pistas!</h1>
      <div className="kids3-choice-grid two">
        {redFlags.map(flag => <Choice key={flag.id} icon={flag.icon} label={flag.label} selected={flags.includes(flag.id)} onClick={() => toggleFlag(flag.id)} />)}
      </div>
      <div className="kids3-counter"><b>{flags.length}</b><span>/2 pistas</span></div>
      {!flagsChecked && <button className="kids3-primary" type="button" disabled={flags.length !== 2} onClick={() => setFlagsChecked(true)}>Conferir</button>}
      {flagsChecked && !clueSuccess && <div className="kids3-feedback hint"><b>Olhe de novo! 👀</b><p>Cadeado sozinho não prova que o site é verdadeiro.</p><button type="button" onClick={() => { setFlags([]); setFlagsChecked(false); }}>Tentar outra vez</button></div>}
      {flagsChecked && clueSuccess && <><div className="kids3-feedback good"><b>Boa investigação! ⭐</b><p>Pressa + endereço estranho = pare e confira.</p></div><button className="kids3-primary" type="button" onClick={() => setScreen('https')}>Próxima missão →</button></>}
    </Scene>
  );

  if (screen === 'https') return (
    <Scene src={firstKidsStory.scenes.https} alt="Theo explica que o cadeado não garante que um site seja confiável" screen="case001-https" caseNumber="001" caseTitle={firstKidsStory.title} progress={42}>
      <span className="kids3-tag">PEGADINHA DIGITAL</span>
      <h1>Cadeado = site seguro?</h1>
      <div className="kids3-choice-grid two">
        <Choice icon="✅" label="Sim" selected={httpsAnswer === 'yes'} wrong={httpsAnswer === 'yes'} onClick={() => setHttpsAnswer('yes')} />
        <Choice icon="🧐" label="Não" selected={httpsAnswer === 'no'} onClick={() => setHttpsAnswer('no')} />
      </div>
      {httpsAnswer && <div className={`kids3-feedback ${httpsAnswer === 'no' ? 'good' : 'hint'}`}><b>{httpsAnswer === 'no' ? 'Isso! 🎉' : 'Quase!'}</b><p>Site falso também pode ter cadeado.</p></div>}
      {httpsAnswer === 'no' && <button className="kids3-primary" type="button" onClick={() => setScreen('action')}>Continuar →</button>}
    </Scene>
  );

  if (screen === 'action') return (
    <Scene src={firstKidsStory.scenes.action} alt="Nina apresenta escolhas para agir com segurança" screen="case001-action" caseNumber="001" caseTitle={firstKidsStory.title} progress={56} compact>
      <span className="kids3-tag">SUA DECISÃO</span>
      <h1>O que fazer agora?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="👆" label="Clicar agora" selected={action === 'click'} wrong={action === 'click'} onClick={() => setAction('click')} />
        <Choice icon="📱" label="Abrir o app oficial" selected={action === 'official'} onClick={() => setAction('official')} />
        <Choice icon="🤝" label="Pedir ajuda" selected={action === 'adult'} onClick={() => setAction('adult')} />
      </div>
      {action && <div className={`kids3-feedback ${actionSafe ? 'good' : 'hint'}`}><b>{actionSafe ? 'Boa escolha! 🛡️' : 'Pense de novo! ✋'}</b><p>{actionSafe ? 'Confira por um caminho conhecido.' : 'Não clique correndo.'}</p></div>}
      {actionSafe && <button className="kids3-primary" type="button" onClick={() => setScreen('team')}>Juntar respostas →</button>}
    </Scene>
  );

  if (screen === 'team') return (
    <Scene src={firstKidsStory.scenes.team} alt="Maya e Caio combinam duas pistas seguras" screen="case001-team" caseNumber="001" caseTitle={firstKidsStory.title} progress={70} compact>
      <span className="kids3-tag">JUNTE AS PISTAS</span>
      <h1>Escolha as 2 respostas!</h1>
      <h2>Qual endereço parece oficial?</h2>
      <div className="kids3-choice-grid one tiny">
        <Choice label="clubeaurora.com.br" selected={domain === 'real'} onClick={() => setDomain('real')} />
        <Choice label="aurora-acesso-seguro.net" selected={domain === 'fake'} wrong={domain === 'fake'} onClick={() => setDomain('fake')} />
      </div>
      <h2>Quem pode ajudar?</h2>
      <div className="kids3-choice-grid one tiny">
        <Choice label="Um adulto de confiança" selected={helper === 'adult'} onClick={() => setHelper('adult')} />
        <Choice label="O número desconhecido" selected={helper === 'sender'} wrong={helper === 'sender'} onClick={() => setHelper('sender')} />
      </div>
      {teamDone && <div className="kids3-feedback good"><b>As pistas combinam! ⭐</b></div>}
      <button className="kids3-primary" type="button" disabled={!teamDone} onClick={() => setScreen('shield')}>Montar escudo ✨</button>
    </Scene>
  );

  if (screen === 'shield') return (
    <Scene src={firstKidsStory.scenes.shield} alt="Luna monta um escudo digital" screen="case001-shield" caseNumber="001" caseTitle={firstKidsStory.title} progress={84} compact>
      <span className="kids3-tag">ESCUDO CONTROOLS</span>
      <h1>Monte seu escudo!</h1>
      <p>Toque nos 3 superpoderes.</p>
      <div className="kids3-choice-grid one">
        {safeSteps.map(step => <Choice key={step.id} icon={step.icon} label={step.label} selected={shieldSteps.includes(step.id)} onClick={() => setShieldSteps(current => current.includes(step.id) ? current.filter(id => id !== step.id) : [...current, step.id])} />)}
      </div>
      {shieldDone && <div className="kids3-feedback good"><b>Escudo completo! ✨</b></div>}
      <button className="kids3-primary" type="button" disabled={!shieldDone} onClick={() => setScreen('ending')}>Ver resultado ⭐</button>
    </Scene>
  );

  return (
    <Scene src={firstKidsStory.scenes.ending} alt="A turma comemora a missão concluída" screen="case001-ending" caseNumber="001" caseTitle={firstKidsStory.title} progress={100} compact>
      <span className="kids3-tag">MISSÃO CUMPRIDA</span>
      <h1>Você conseguiu!</h1>
      <p><b>Parou. Pensou. Confirmou.</b></p>
      <div className="kids3-badges"><span>🔎<b>Olho de lince</b></span><span>🛡️<b>Pensou antes</b></span><span>⭐<b>Guardião digital</b></span></div>
      <button className="kids3-primary" type="button" onClick={reset}>Jogar de novo ↻</button>
      <button className="kids3-secondary" type="button" onClick={onExit}>Outros casos</button>
    </Scene>
  );
}

function Case002Game({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Case002Screen>('warning');
  const [weakAnswer, setWeakAnswer] = useState<'easy' | 'long1' | 'long2' | null>(null);
  const [strongAnswer, setStrongAnswer] = useState<'name' | 'phrase' | 'sequence' | null>(null);
  const [reuseAnswer, setReuseAnswer] = useState<'yes' | 'no' | null>(null);
  const [codeAnswer, setCodeAnswer] = useState<'send' | 'secret' | 'group' | null>(null);
  const [habits, setHabits] = useState<string[]>([]);
  const [habitsChecked, setHabitsChecked] = useState(false);

  const keyHabits = passwordHabits.filter(item => item.id !== 'reuse');
  const keySuccess = habits.length === 3 && habits.every(id => passwordHabits.find(item => item.id === id)?.correct);

  function toggleHabit(id: string) {
    if (habitsChecked) return;
    setHabits(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current);
  }

  function reset() {
    setScreen('warning');
    setWeakAnswer(null);
    setStrongAnswer(null);
    setReuseAnswer(null);
    setCodeAnswer(null);
    setHabits([]);
    setHabitsChecked(false);
  }

  if (screen === 'warning') return (
    <Scene src={secondKidsStory.scenes.warning} alt="Luna encontra um cofre digital protegido por uma senha fácil" screen="case002-warning" caseNumber="002" caseTitle={secondKidsStory.title} progress={14}>
      <span className="kids3-tag blue">NOVA MISSÃO</span>
      <h1>O cofre está em risco!</h1>
      <p>Alguém tentou abrir usando uma senha fácil de adivinhar.</p>
      <div className="kids3-story-chip">🔐 <b>Precisamos proteger os segredos.</b></div>
      <button className="kids3-primary cyan" type="button" onClick={() => setScreen('weak')}>Descobrir o problema →</button>
    </Scene>
  );

  if (screen === 'weak') return (
    <Scene src={secondKidsStory.scenes.weak} alt="Maya compara exemplos de senhas fáceis de adivinhar" screen="case002-weak" caseNumber="002" caseTitle={secondKidsStory.title} progress={28} compact>
      <span className="kids3-tag blue">PISTA 1</span>
      <h1>Qual é fácil de adivinhar?</h1>
      <div className="kids3-choice-grid one password-options">
        <Choice label="123456" selected={weakAnswer === 'easy'} onClick={() => setWeakAnswer('easy')} />
        <Choice label="Nuvem Salta Sobre 4 Luas" selected={weakAnswer === 'long1'} wrong={weakAnswer === 'long1'} onClick={() => setWeakAnswer('long1')} />
        <Choice label="Pato Roxo Viaja 27" selected={weakAnswer === 'long2'} wrong={weakAnswer === 'long2'} onClick={() => setWeakAnswer('long2')} />
      </div>
      {weakAnswer && <div className={`kids3-feedback ${weakAnswer === 'easy' ? 'good' : 'hint'}`}><b>{weakAnswer === 'easy' ? 'Isso! 🔓' : 'Olhe de novo.'}</b><p>{weakAnswer === 'easy' ? 'Sequências muito comuns são fáceis de tentar.' : 'Uma frase longa costuma ser mais difícil de adivinhar.'}</p></div>}
      {weakAnswer === 'easy' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('strong')}>Fortalecer o cofre →</button>}
    </Scene>
  );

  if (screen === 'strong') return (
    <Scene src={secondKidsStory.scenes.strong} alt="Theo mostra como uma senha longa pode proteger melhor uma conta" screen="case002-strong" caseNumber="002" caseTitle={secondKidsStory.title} progress={42} compact>
      <span className="kids3-tag blue">PISTA 2</span>
      <h1>Qual segredo é melhor?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="👤" label="Meu nome" selected={strongAnswer === 'name'} wrong={strongAnswer === 'name'} onClick={() => setStrongAnswer('name')} />
        <Choice icon="💬" label="Uma frase longa e só minha" selected={strongAnswer === 'phrase'} onClick={() => setStrongAnswer('phrase')} />
        <Choice icon="🔢" label="12345678" selected={strongAnswer === 'sequence'} wrong={strongAnswer === 'sequence'} onClick={() => setStrongAnswer('sequence')} />
      </div>
      {strongAnswer && <div className={`kids3-feedback ${strongAnswer === 'phrase' ? 'good' : 'hint'}`}><b>{strongAnswer === 'phrase' ? 'Boa! 🛡️' : 'Quase!'}</b><p>{strongAnswer === 'phrase' ? 'Comprida e difícil de adivinhar é uma ótima ideia.' : 'Evite nomes e sequências óbvias.'}</p></div>}
      {strongAnswer === 'phrase' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('reuse')}>Próxima pista →</button>}
    </Scene>
  );

  if (screen === 'reuse') return (
    <Scene src={secondKidsStory.scenes.reuse} alt="Nina observa duas contas ligadas pela mesma chave" screen="case002-reuse" caseNumber="002" caseTitle={secondKidsStory.title} progress={56}>
      <span className="kids3-tag blue">PISTA 3</span>
      <h1>Mesma senha em tudo?</h1>
      <div className="kids3-choice-grid two">
        <Choice icon="🔁" label="Sim" selected={reuseAnswer === 'yes'} wrong={reuseAnswer === 'yes'} onClick={() => setReuseAnswer('yes')} />
        <Choice icon="🗝️" label="Não" selected={reuseAnswer === 'no'} onClick={() => setReuseAnswer('no')} />
      </div>
      {reuseAnswer && <div className={`kids3-feedback ${reuseAnswer === 'no' ? 'good' : 'hint'}`}><b>{reuseAnswer === 'no' ? 'Correto! ⭐' : 'Ops!'}</b><p>{reuseAnswer === 'no' ? 'Uma senha diferente protege cada conta separadamente.' : 'Se uma senha vazar, outras contas também podem ficar em risco.'}</p></div>}
      {reuseAnswer === 'no' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('code')}>Continuar →</button>}
    </Scene>
  );

  if (screen === 'code') return (
    <Scene src={secondKidsStory.scenes.code} alt="Caio protege um código de verificação no celular" screen="case002-code" caseNumber="002" caseTitle={secondKidsStory.title} progress={70} compact>
      <span className="kids3-tag blue">CÓDIGO SECRETO</span>
      <h1>Pedirem seu código?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="📤" label="Enviar para a pessoa" selected={codeAnswer === 'send'} wrong={codeAnswer === 'send'} onClick={() => setCodeAnswer('send')} />
        <Choice icon="🤫" label="Não compartilhar" selected={codeAnswer === 'secret'} onClick={() => setCodeAnswer('secret')} />
        <Choice icon="💬" label="Postar no grupo" selected={codeAnswer === 'group'} wrong={codeAnswer === 'group'} onClick={() => setCodeAnswer('group')} />
      </div>
      {codeAnswer && <div className={`kids3-feedback ${codeAnswer === 'secret' ? 'good' : 'hint'}`}><b>{codeAnswer === 'secret' ? 'Segredo protegido! 🔐' : 'Código é segredo!'}</b><p>Nunca entregue um código de verificação a quem pedir por mensagem.</p></div>}
      {codeAnswer === 'secret' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('key')}>Montar a chave →</button>}
    </Scene>
  );

  if (screen === 'key') return (
    <Scene src={secondKidsStory.scenes.key} alt="Luna monta a chave de segurança do cofre" screen="case002-key" caseNumber="002" caseTitle={secondKidsStory.title} progress={84} compact>
      <span className="kids3-tag blue">CHAVE MESTRA</span>
      <h1>Escolha 3 hábitos!</h1>
      <div className="kids3-choice-grid one tiny">
        {keyHabits.map(item => <Choice key={item.id} icon={item.icon} label={item.label} selected={habits.includes(item.id)} onClick={() => toggleHabit(item.id)} />)}
      </div>
      <div className="kids3-counter"><b>{habits.length}</b><span>/3 hábitos</span></div>
      {!habitsChecked && <button className="kids3-primary cyan" type="button" disabled={habits.length !== 3} onClick={() => setHabitsChecked(true)}>Testar a chave 🔑</button>}
      {habitsChecked && !keySuccess && <div className="kids3-feedback hint"><b>A chave não girou ainda.</b><p>Evite informações fáceis de descobrir.</p><button type="button" onClick={() => { setHabits([]); setHabitsChecked(false); }}>Tentar outra vez</button></div>}
      {habitsChecked && keySuccess && <><div className="kids3-feedback good"><b>Chave completa! ✨</b></div><button className="kids3-primary cyan" type="button" onClick={() => setScreen('ending')}>Abrir o resultado →</button></>}
    </Scene>
  );

  return (
    <Scene src={secondKidsStory.scenes.ending} alt="A turma comemora com o cofre digital protegido" screen="case002-ending" caseNumber="002" caseTitle={secondKidsStory.title} progress={100} compact>
      <span className="kids3-tag blue">COFRE PROTEGIDO</span>
      <h1>Missão cumprida!</h1>
      <p><b>Longa. Única. Secreta.</b></p>
      <div className="kids3-badges"><span>🔐<b>Guardião do cofre</b></span><span>🗝️<b>Chave forte</b></span><span>⭐<b>Herói digital</b></span></div>
      <button className="kids3-primary cyan" type="button" onClick={reset}>Jogar de novo ↻</button>
      <button className="kids3-secondary" type="button" onClick={onExit}>Outros casos</button>
    </Scene>
  );
}

export default function KidsStoryPrototype() {
  const [mode, setMode] = useState<AppMode>('library');
  const [gameId, setGameId] = useState<KidsGameId>('case-001');

  const game = gameId === 'case-001' ? firstKidsStory : secondKidsStory;
  const assets = gameId === 'case-001' ? case001Assets : case002Assets;

  const chooseGame = useCallback((id: KidsGameId) => {
    setGameId(id);
    setMode('loading');
  }, []);

  const startGame = useCallback(() => setMode('playing'), []);
  const exitGame = useCallback(() => setMode('library'), []);

  return (
    <main className="kids-game kids3-root">
      {mode === 'library' && <GameLibrary onChoose={chooseGame} />}
      {mode === 'loading' && <LoadingCover game={game} assets={assets} onReady={startGame} />}
      {mode === 'playing' && gameId === 'case-001' && <Case001Game onExit={exitGame} />}
      {mode === 'playing' && gameId === 'case-002' && <Case002Game onExit={exitGame} />}
    </main>
  );
}
