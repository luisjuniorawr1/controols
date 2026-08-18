'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  case002Assets,
  passwordHabits,
  secondKidsStory,
} from '@/src/game/kidsStory';

type AppMode = 'library' | 'loading' | 'playing';
type Case002Screen = 'warning' | 'weak' | 'strong' | 'reuse' | 'code' | 'key' | 'ending';

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
  progress,
  children,
  compact = false,
}: {
  src: string;
  alt: string;
  screen: string;
  progress: number;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="kids3-scene" data-screen={screen}>
      <img className="kids3-scene-art" src={src} alt={alt} />
      <aside className={`kids3-panel${compact ? ' is-compact' : ''}`}>
        <div className="kids3-panel-meta">
          <span>AVENTURA CONTROOLS</span>
          <small>{secondKidsStory.title}</small>
        </div>
        <div className="kids3-progress" aria-label={`Progresso ${progress}%`}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <div className="kids3-panel-body">{children}</div>
      </aside>
    </section>
  );
}

function LoadingCover({ onReady }: { onReady: () => void }) {
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
        if (active) setLoaded(current => Math.min(case002Assets.length, current + 1));
        resolve();
      };
      image.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
      image.src = src;
      if (image.complete && image.naturalWidth > 0) {
        if (active) setLoaded(current => Math.min(case002Assets.length, current + 1));
        resolve();
      }
    });

    Promise.all(case002Assets.map(loadOne))
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
  }, [attempt, onReady]);

  const percent = Math.round((loaded / case002Assets.length) * 100);

  return (
    <section className="kids3-loader" data-screen="loading-case-002">
      <img className="kids3-loader-art" src={secondKidsStory.cover} alt={`Capa de ${secondKidsStory.title}`} />
      <div className="kids3-loader-shade" />
      <div className="kids3-loader-card">
        <span>AVENTURA CONTROOLS</span>
        <h1>{secondKidsStory.title}</h1>
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

function GameLibrary({ onChoose }: { onChoose: () => void }) {
  return (
    <section className="kids3-library" data-screen="library">
      <div className="kids3-library-heading">
        <b>CONTROOLS</b>
        <h1>Aventura atual</h1>
        <p>Nova história em desenvolvimento</p>
      </div>
      <div className="kids3-game-grid">
        <button type="button" className="kids3-game-card" onClick={onChoose}>
          <img src={secondKidsStory.cover} alt="" />
          <span className="kids3-game-card-shade" />
          <div>
            <small>HISTÓRIA REFERÊNCIA</small>
            <h2>{secondKidsStory.title}</h2>
            <p>{secondKidsStory.subtitle}</p>
            <b>JOGAR ▶</b>
          </div>
        </button>
      </div>
    </section>
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
    <Scene src={secondKidsStory.scenes.warning} alt="Luna encontra um cofre digital protegido por uma senha fácil" screen="case002-warning" progress={14}>
      <span className="kids3-tag blue">NOVA MISSÃO</span>
      <h1>O cofre está em risco!</h1>
      <p>Alguém tentou abrir usando uma senha fácil de adivinhar.</p>
      <div className="kids3-story-chip">🔐 <b>Precisamos proteger os segredos.</b></div>
      <button className="kids3-primary cyan" type="button" onClick={() => setScreen('weak')}>Descobrir o problema →</button>
    </Scene>
  );

  if (screen === 'weak') return (
    <Scene src={secondKidsStory.scenes.weak} alt="Maya compara exemplos de senhas fáceis de adivinhar" screen="case002-weak" progress={28} compact>
      <span className="kids3-tag blue">PISTA 1</span>
      <h1>Qual senha é fácil de adivinhar?</h1>
      <div className="kids3-choice-grid one password-options">
        <Choice label="123456" selected={weakAnswer === 'easy'} onClick={() => setWeakAnswer('easy')} />
        <Choice label="Bolo com 3 Velas" selected={weakAnswer === 'long1'} wrong={weakAnswer === 'long1'} onClick={() => setWeakAnswer('long1')} />
        <Choice label="3 Chaves Douradas" selected={weakAnswer === 'long2'} wrong={weakAnswer === 'long2'} onClick={() => setWeakAnswer('long2')} />
      </div>
      {weakAnswer && <div className={`kids3-feedback case002-weak-feedback ${weakAnswer === 'easy' ? 'good' : 'hint'}`}><b>{weakAnswer === 'easy' ? 'Isso! 🔓' : 'Olhe de novo.'}</b><p>{weakAnswer === 'easy' ? '123456 é uma sequência muito comum e fácil de tentar.' : 'Pense nas três pistas da imagem: a sequência de números é a mais óbvia.'}</p></div>}
      {weakAnswer === 'easy' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('strong')}>Fortalecer o cofre →</button>}
    </Scene>
  );

  if (screen === 'strong') return (
    <Scene src={secondKidsStory.scenes.strong} alt="Theo mostra como uma senha longa pode proteger melhor uma conta" screen="case002-strong" progress={42} compact>
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
    <Scene src={secondKidsStory.scenes.reuse} alt="Nina observa duas contas ligadas pela mesma chave" screen="case002-reuse" progress={56}>
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
    <Scene src={secondKidsStory.scenes.code} alt="Caio protege um código de verificação no celular" screen="case002-code" progress={70} compact>
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
    <Scene src={secondKidsStory.scenes.key} alt="Luna monta a chave de segurança do cofre" screen="case002-key" progress={84} compact>
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
    <Scene src={secondKidsStory.scenes.ending} alt="A turma comemora com o cofre digital protegido" screen="case002-ending" progress={100} compact>
      <span className="kids3-tag blue">COFRE PROTEGIDO</span>
      <h1>Missão cumprida!</h1>
      <p><b>Longa. Única. Secreta.</b></p>
      <div className="kids3-badges"><span>🔐<b>Guardião do cofre</b></span><span>🗝️<b>Chave forte</b></span><span>⭐<b>Herói digital</b></span></div>
      <button className="kids3-primary cyan" type="button" onClick={reset}>Jogar de novo ↻</button>
      <button className="kids3-secondary" type="button" onClick={onExit}>Voltar ao catálogo</button>
    </Scene>
  );
}

export default function KidsStoryPrototype() {
  const [mode, setMode] = useState<AppMode>('library');

  const chooseGame = useCallback(() => setMode('loading'), []);
  const startGame = useCallback(() => setMode('playing'), []);
  const exitGame = useCallback(() => setMode('library'), []);

  return (
    <main className="kids-game kids3-root">
      {mode === 'library' && <GameLibrary onChoose={chooseGame} />}
      {mode === 'loading' && <LoadingCover onReady={startGame} />}
      {mode === 'playing' && <Case002Game onExit={exitGame} />}
    </main>
  );
}
