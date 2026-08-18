'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  case002Assets,
  case004Assets,
  case005Assets,
  case006Assets,
  fifthKidsStory,
  sixthKidsStory,
  fourthKidsStory,
  kidsGames,
  passwordHabits,
  photoHabits,
  playerHabits,
  messageHabits,
  secondKidsStory,
  type KidsGameId,
} from '@/src/game/kidsStory';

type AppMode = 'library' | 'loading' | 'playing';
type Case002Screen = 'warning' | 'weak' | 'strong' | 'reuse' | 'code' | 'key' | 'ending';
type Case004Screen = 'warning' | 'clues' | 'principle' | 'permission' | 'risk' | 'shield' | 'ending';
type Case005Screen = 'warning' | 'personal' | 'app' | 'limits' | 'pressure' | 'shield' | 'ending';
type Case006Screen = 'warning' | 'clues' | 'confirm' | 'pause' | 'risk' | 'lighthouse' | 'ending';

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
  storyTitle,
  children,
  compact = false,
}: {
  src: string;
  alt: string;
  screen: string;
  progress: number;
  storyTitle: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="kids3-scene" data-screen={screen}>
      <img className="kids3-scene-art" src={src} alt={alt} />
      <aside className={`kids3-panel${compact ? ' is-compact' : ''}`}>
        <div className="kids3-panel-meta">
          <span>AVENTURA CONTROOLS</span>
          <small>{storyTitle}</small>
        </div>
        <div className="kids3-progress" aria-label={`Progresso ${progress}%`}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <div className="kids3-panel-body">{children}</div>
      </aside>
    </section>
  );
}

type LoadingStory = {
  id: KidsGameId;
  title: string;
  cover: string;
};

function LoadingCover({ story, assets, onReady }: { story: LoadingStory; assets: readonly string[]; onReady: () => void }) {
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
    <section className="kids3-loader" data-screen={`loading-${story.id}`}>
      <img className="kids3-loader-art" src={story.cover} alt={`Capa de ${story.title}`} />
      <div className="kids3-loader-shade" />
      <div className="kids3-loader-card">
        <span>AVENTURA CONTROOLS</span>
        <h1>{story.title}</h1>
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
  const [featuredId, setFeaturedId] = useState<KidsGameId>('case-006');
  const featured = kidsGames.find(story => story.id === featuredId) ?? kidsGames[0];
  const featuredLabel = featuredId === 'case-006' ? 'NOVA AVENTURA' : featuredId === 'case-002' ? 'HISTÓRIA REFERÊNCIA' : 'AVENTURA CONTROOLS';

  return (
    <section className="kids3-library" data-screen="library">
      <div className="kids3-library-heading">
        <b>CONTROOLS</b>
        <h1>Escolha uma aventura</h1>
        <p>{kidsGames.length} histórias jogáveis</p>
      </div>
      <div className="kids3-game-grid">
        <button type="button" className="kids3-game-card" onClick={() => onChoose(featured.id)} aria-label={`Jogar ${featured.title}`}>
          <img src={featured.cover} alt="" />
          <span className="kids3-game-card-shade" />
          <div>
            <small>{featuredLabel}</small>
            <h2>{featured.title}</h2>
            <p>{featured.subtitle}</p>
            <b>JOGAR ▶</b>
          </div>
        </button>
      </div>
      <div className="kids3-catalog-rail" aria-label="Catálogo de aventuras">
        <strong>Aventuras</strong>
        <div>
          {kidsGames.map(story => (
            <button
              key={story.id}
              type="button"
              className={`kids3-catalog-tile${story.id === featuredId ? ' is-active' : ''}`}
              aria-pressed={story.id === featuredId}
              aria-label={`Destacar ${story.title}`}
              onClick={() => setFeaturedId(story.id)}
            >
              <img src={story.cover} alt="" />
              <span><small>{story.id === 'case-006' ? 'NOVA' : story.id === 'case-002' ? 'REFERÊNCIA' : 'AVENTURA'}</small><b>{story.title}</b></span>
            </button>
          ))}
        </div>
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
    <Scene storyTitle={secondKidsStory.title} src={secondKidsStory.scenes.warning} alt="Luna encontra um cofre digital protegido por uma senha fácil" screen="case002-warning" progress={14}>
      <span className="kids3-tag blue">NOVA MISSÃO</span>
      <h1>O cofre está em risco!</h1>
      <p>Alguém tentou abrir usando uma senha fácil de adivinhar.</p>
      <div className="kids3-story-chip">🔐 <b>Precisamos proteger os segredos.</b></div>
      <button className="kids3-primary cyan" type="button" onClick={() => setScreen('weak')}>Descobrir o problema →</button>
    </Scene>
  );

  if (screen === 'weak') return (
    <Scene storyTitle={secondKidsStory.title} src={secondKidsStory.scenes.weak} alt="Maya compara exemplos de senhas fáceis de adivinhar" screen="case002-weak" progress={28} compact>
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
    <Scene storyTitle={secondKidsStory.title} src={secondKidsStory.scenes.strong} alt="Theo mostra como uma senha longa pode proteger melhor uma conta" screen="case002-strong" progress={42} compact>
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
    <Scene storyTitle={secondKidsStory.title} src={secondKidsStory.scenes.reuse} alt="Nina observa duas contas ligadas pela mesma chave" screen="case002-reuse" progress={56}>
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
    <Scene storyTitle={secondKidsStory.title} src={secondKidsStory.scenes.code} alt="Caio protege um código de verificação no celular" screen="case002-code" progress={70} compact>
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
    <Scene storyTitle={secondKidsStory.title} src={secondKidsStory.scenes.key} alt="Luna monta a chave de segurança do cofre" screen="case002-key" progress={84} compact>
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
    <Scene storyTitle={secondKidsStory.title} src={secondKidsStory.scenes.ending} alt="A turma comemora com o cofre digital protegido" screen="case002-ending" progress={100} compact>
      <span className="kids3-tag blue">COFRE PROTEGIDO</span>
      <h1>Missão cumprida!</h1>
      <p><b>Longa. Única. Secreta.</b></p>
      <div className="kids3-badges"><span>🔐<b>Guardião do cofre</b></span><span>🗝️<b>Chave forte</b></span><span>⭐<b>Herói digital</b></span></div>
      <button className="kids3-primary cyan" type="button" onClick={reset}>Jogar de novo ↻</button>
      <button className="kids3-secondary" type="button" onClick={onExit}>Voltar ao catálogo</button>
    </Scene>
  );
}

function Case004Game({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Case004Screen>('warning');
  const [clueAnswer, setClueAnswer] = useState<'building' | 'tree' | 'lamp' | null>(null);
  const [principleAnswer, setPrincipleAnswer] = useState<'hide' | 'show' | null>(null);
  const [permissionAnswer, setPermissionAnswer] = useState<'ask' | 'post' | null>(null);
  const [riskAnswer, setRiskAnswer] = useState<'tell' | 'adult' | 'photo' | null>(null);
  const [habits, setHabits] = useState<string[]>([]);
  const [habitsChecked, setHabitsChecked] = useState(false);

  const shieldSuccess = habits.length === 3 && habits.every(id => photoHabits.find(item => item.id === id)?.correct);

  function toggleHabit(id: string) {
    if (habitsChecked) return;
    setHabits(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current);
  }

  function reset() {
    setScreen('warning');
    setClueAnswer(null);
    setPrincipleAnswer(null);
    setPermissionAnswer(null);
    setRiskAnswer(null);
    setHabits([]);
    setHabitsChecked(false);
  }

  if (screen === 'warning') return (
    <Scene storyTitle={fourthKidsStory.title} src={fourthKidsStory.scenes.warning} alt="Luna percebe que a foto da turma mostra detalhes do lugar ao fundo" screen="case004-warning" progress={14}>
      <span className="kids3-tag blue">NOVA MISSÃO</span>
      <h1>Essa foto conta demais!</h1>
      <p>A foto ficou ótima, mas o fundo pode revelar onde a turma está.</p>
      <div className="kids3-story-chip">📸 <b>Antes de postar, vamos investigar.</b></div>
      <button className="kids3-primary cyan" type="button" onClick={() => setScreen('clues')}>Investigar a foto →</button>
    </Scene>
  );

  if (screen === 'clues') return (
    <Scene storyTitle={fourthKidsStory.title} src={fourthKidsStory.scenes.clues} alt="Maya observa uma foto e compara pistas do lugar ao fundo" screen="case004-clues" progress={28} compact>
      <span className="kids3-tag blue">PISTA 1</span>
      <h1>Qual detalhe pode revelar o lugar?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="🏫" label="O prédio ao fundo" selected={clueAnswer === 'building'} onClick={() => setClueAnswer('building')} />
        <Choice icon="🌳" label="A árvore" selected={clueAnswer === 'tree'} wrong={clueAnswer === 'tree'} onClick={() => setClueAnswer('tree')} />
        <Choice icon="💡" label="O poste" selected={clueAnswer === 'lamp'} wrong={clueAnswer === 'lamp'} onClick={() => setClueAnswer('lamp')} />
      </div>
      {clueAnswer && <div className={`kids3-feedback ${clueAnswer === 'building' ? 'good' : 'hint'}`}><b>{clueAnswer === 'building' ? 'Isso! 👀' : 'Olhe mais uma vez.'}</b><p>{clueAnswer === 'building' ? 'Um prédio conhecido pode mostrar exatamente onde a foto foi tirada.' : 'Procure o detalhe que identifica o lugar, não apenas um objeto comum.'}</p></div>}
      {clueAnswer === 'building' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('principle')}>Preparar a foto →</button>}
    </Scene>
  );

  if (screen === 'principle') return (
    <Scene storyTitle={fourthKidsStory.title} src={fourthKidsStory.scenes.principle} alt="Theo compara a foto original com uma versão que esconde detalhes do local" screen="case004-principle" progress={42} compact>
      <span className="kids3-tag blue">PISTA 2</span>
      <h1>Qual foto protege melhor?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="🛡️" label="A que esconde detalhes do lugar" selected={principleAnswer === 'hide'} onClick={() => setPrincipleAnswer('hide')} />
        <Choice icon="🔎" label="A que mostra tudo" selected={principleAnswer === 'show'} wrong={principleAnswer === 'show'} onClick={() => setPrincipleAnswer('show')} />
      </div>
      {principleAnswer && <div className={`kids3-feedback ${principleAnswer === 'hide' ? 'good' : 'hint'}`}><b>{principleAnswer === 'hide' ? 'Boa! 🛡️' : 'Quase!'}</b><p>{principleAnswer === 'hide' ? 'Revisar o fundo antes de compartilhar ajuda a proteger a localização.' : 'Nem todo detalhe precisa aparecer para a foto continuar legal.'}</p></div>}
      {principleAnswer === 'hide' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('permission')}>Próxima pista →</button>}
    </Scene>
  );

  if (screen === 'permission') return (
    <Scene storyTitle={fourthKidsStory.title} src={fourthKidsStory.scenes.permission} alt="Nina mostra a Caio uma foto dos dois antes de publicar" screen="case004-permission" progress={56} compact>
      <span className="kids3-tag blue">PISTA 3</span>
      <h1>Outra pessoa aparece. O que fazer?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="🤝" label="Perguntar antes de postar" selected={permissionAnswer === 'ask'} onClick={() => setPermissionAnswer('ask')} />
        <Choice icon="📤" label="Postar sem avisar" selected={permissionAnswer === 'post'} wrong={permissionAnswer === 'post'} onClick={() => setPermissionAnswer('post')} />
      </div>
      {permissionAnswer && <div className={`kids3-feedback ${permissionAnswer === 'ask' ? 'good' : 'hint'}`}><b>{permissionAnswer === 'ask' ? 'Respeito! ⭐' : 'Melhor perguntar.'}</b><p>{permissionAnswer === 'ask' ? 'Quem aparece na foto também pode decidir se quer ser publicado.' : 'Uma foto de outra pessoa também envolve a privacidade dela.'}</p></div>}
      {permissionAnswer === 'ask' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('risk')}>Continuar →</button>}
    </Scene>
  );

  if (screen === 'risk') return (
    <Scene storyTitle={fourthKidsStory.title} src={fourthKidsStory.scenes.risk} alt="Caio recebe uma mensagem perguntando onde a turma estuda" screen="case004-risk" progress={70} compact>
      <span className="kids3-tag blue">MENSAGEM ESTRANHA</span>
      <h1>Pedem onde vocês estudam. E agora?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="📍" label="Contar onde é" selected={riskAnswer === 'tell'} wrong={riskAnswer === 'tell'} onClick={() => setRiskAnswer('tell')} />
        <Choice icon="🧑‍🤝‍🧑" label="Não responder e avisar um adulto" selected={riskAnswer === 'adult'} onClick={() => setRiskAnswer('adult')} />
        <Choice icon="📸" label="Mandar outra foto" selected={riskAnswer === 'photo'} wrong={riskAnswer === 'photo'} onClick={() => setRiskAnswer('photo')} />
      </div>
      {riskAnswer && <div className={`kids3-feedback ${riskAnswer === 'adult' ? 'good' : 'hint'}`}><b>{riskAnswer === 'adult' ? 'Boa decisão! 🔐' : 'Proteja essa informação.'}</b><p>{riskAnswer === 'adult' ? 'Você não precisa contar sua localização para quem pergunta por mensagem.' : 'Não envie endereço, escola ou outra foto para explicar onde está.'}</p></div>}
      {riskAnswer === 'adult' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('shield')}>Montar o escudo →</button>}
    </Scene>
  );

  if (screen === 'shield') return (
    <Scene storyTitle={fourthKidsStory.title} src={fourthKidsStory.scenes.shield} alt="Luna monta um escudo de privacidade com hábitos para compartilhar fotos" screen="case004-shield" progress={84} compact>
      <span className="kids3-tag blue">ESCUDO DA FOTO</span>
      <h1>Escolha 3 hábitos!</h1>
      <div className="kids3-choice-grid one tiny photo-habits">
        {photoHabits.map(item => <Choice key={item.id} icon={item.icon} label={item.label} selected={habits.includes(item.id)} onClick={() => toggleHabit(item.id)} />)}
      </div>
      <div className="kids3-counter"><b>{habits.length}</b><span>/3 hábitos</span></div>
      {!habitsChecked && <button className="kids3-primary cyan" type="button" disabled={habits.length !== 3} onClick={() => setHabitsChecked(true)}>Ativar o escudo 🛡️</button>}
      {habitsChecked && !shieldSuccess && <div className="kids3-feedback hint"><b>O escudo ainda tem uma brecha.</b><p>Pense no fundo, nas pessoas e na localização.</p><button type="button" onClick={() => { setHabits([]); setHabitsChecked(false); }}>Tentar outra vez</button></div>}
      {habitsChecked && shieldSuccess && <><div className="kids3-feedback good"><b>Escudo completo! ✨</b></div><button className="kids3-primary cyan" type="button" onClick={() => setScreen('ending')}>Ver a foto segura →</button></>}
    </Scene>
  );

  return (
    <Scene storyTitle={fourthKidsStory.title} src={fourthKidsStory.scenes.ending} alt="A turma comemora com uma foto protegida por um escudo de privacidade" screen="case004-ending" progress={100} compact>
      <span className="kids3-tag blue">FOTO PROTEGIDA</span>
      <h1>Missão cumprida!</h1>
      <p><b>Olhe. Pergunte. Proteja.</b></p>
      <div className="kids3-badges"><span>👀<b>Olho atento</b></span><span>🤝<b>Respeito</b></span><span>🛡️<b>Privacidade</b></span></div>
      <button className="kids3-primary cyan" type="button" onClick={reset}>Jogar de novo ↻</button>
      <button className="kids3-secondary" type="button" onClick={onExit}>Voltar ao catálogo</button>
    </Scene>
  );
}


function Case005Game({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Case005Screen>('warning');
  const [warningAnswer, setWarningAnswer] = useState<'observe' | 'accept' | 'school' | null>(null);
  const [personalAnswer, setPersonalAnswer] = useState<'protect' | 'school' | 'nearby' | null>(null);
  const [appAnswer, setAppAnswer] = useState<'stay' | 'leave' | 'phone' | null>(null);
  const [limitsAnswer, setLimitsAnswer] = useState<'stop' | 'polite' | 'details' | null>(null);
  const [pressureAnswer, setPressureAnswer] = useState<'adult' | 'photo' | 'quick' | null>(null);
  const [habits, setHabits] = useState<string[]>([]);
  const [habitsChecked, setHabitsChecked] = useState(false);
  const shieldSuccess = habits.length === 3 && habits.every(id => playerHabits.find(item => item.id === id)?.correct);

  function toggleHabit(id: string) {
    if (habitsChecked) return;
    setHabits(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current);
  }

  function reset() {
    setScreen('warning');
    setWarningAnswer(null);
    setPersonalAnswer(null);
    setAppAnswer(null);
    setLimitsAnswer(null);
    setPressureAnswer(null);
    setHabits([]);
    setHabitsChecked(false);
  }

  if (screen === 'warning') return (
    <Scene storyTitle={fifthKidsStory.title} src={fifthKidsStory.scenes.warning} alt="Luna e a turma recebem um convite de um jogador desconhecido" screen="case005-warning" progress={14} compact>
      <span className="kids3-tag blue">NOVO JOGADOR</span>
      <h1>Alguém desconhecido quer entrar.</h1>
      <p>Ele parece amigável, mas ninguém sabe quem está do outro lado.</p>
      <div className="kids3-choice-grid one">
        <Choice icon="👀" label="Observar com calma antes de confiar" selected={warningAnswer === 'observe'} onClick={() => setWarningAnswer('observe')} />
        <Choice icon="⚡" label="Aceitar rápido e conversar" selected={warningAnswer === 'accept'} wrong={warningAnswer === 'accept'} onClick={() => setWarningAnswer('accept')} />
        <Choice icon="🏫" label="Contar o nome da escola" selected={warningAnswer === 'school'} wrong={warningAnswer === 'school'} onClick={() => setWarningAnswer('school')} />
      </div>
      {warningAnswer && <div className={`kids3-feedback ${warningAnswer === 'observe' ? 'good' : 'hint'}`}><b>{warningAnswer === 'observe' ? 'Boa escolha! 👀' : 'Calma primeiro.'}</b><p>{warningAnswer === 'observe' ? 'Nem todo jogador é quem diz ser. Primeiro observe e proteja suas informações.' : 'Ser educado não significa contar informações pessoais ou confiar rápido.'}</p></div>}
      {warningAnswer === 'observe' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('personal')}>Ver a próxima mensagem →</button>}
    </Scene>
  );

  if (screen === 'personal') return (
    <Scene storyTitle={fifthKidsStory.title} src={fifthKidsStory.scenes.personal} alt="Maya observa uma mensagem perguntando qual escola a turma frequenta" screen="case005-personal" progress={28} compact>
      <span className="kids3-tag blue">PISTA 1</span>
      <h1>“Qual escola você estuda?”</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="🛡️" label="Prefiro não contar informações pessoais" selected={personalAnswer === 'protect'} onClick={() => setPersonalAnswer('protect')} />
        <Choice icon="🏫" label="Contar o nome da escola" selected={personalAnswer === 'school'} wrong={personalAnswer === 'school'} onClick={() => setPersonalAnswer('school')} />
        <Choice icon="📍" label="Dizer que moro perto da escola" selected={personalAnswer === 'nearby'} wrong={personalAnswer === 'nearby'} onClick={() => setPersonalAnswer('nearby')} />
      </div>
      {personalAnswer && <div className={`kids3-feedback ${personalAnswer === 'protect' ? 'good' : 'hint'}`}><b>{personalAnswer === 'protect' ? 'Isso! 🛡️' : 'Essa informação é pessoal.'}</b><p>Escola, endereço, telefone e localização ajudam alguém a descobrir onde você está.</p></div>}
      {personalAnswer === 'protect' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('app')}>Continuar →</button>}
    </Scene>
  );

  if (screen === 'app') return (
    <Scene storyTitle={fifthKidsStory.title} src={fifthKidsStory.scenes.app} alt="Theo compara permanecer no jogo com levar a conversa para outro aplicativo" screen="case005-app" progress={42} compact>
      <span className="kids3-tag blue">PISTA 2</span>
      <h1>“Me chama em outro aplicativo!”</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="🎮" label="Ficar no ambiente conhecido e falar com um adulto" selected={appAnswer === 'stay'} onClick={() => setAppAnswer('stay')} />
        <Choice icon="📱" label="Ir para outro aplicativo sem avisar" selected={appAnswer === 'leave'} wrong={appAnswer === 'leave'} onClick={() => setAppAnswer('leave')} />
        <Choice icon="☎️" label="Passar o número de telefone" selected={appAnswer === 'phone'} wrong={appAnswer === 'phone'} onClick={() => setAppAnswer('phone')} />
      </div>
      {appAnswer && <div className={`kids3-feedback ${appAnswer === 'stay' ? 'good' : 'hint'}`}><b>{appAnswer === 'stay' ? 'Muito bem! 🎮' : 'Sinal de cuidado.'}</b><p>{appAnswer === 'stay' ? 'Pressão para mudar de aplicativo é um bom momento para pedir ajuda.' : 'Não entregue contato pessoal nem saia do ambiente conhecido por pressão.'}</p></div>}
      {appAnswer === 'stay' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('limits')}>Próxima pista →</button>}
    </Scene>
  );

  if (screen === 'limits') return (
    <Scene storyTitle={fifthKidsStory.title} src={fifthKidsStory.scenes.limits} alt="Nina coloca um limite em uma conversa insistente dentro do jogo" screen="case005-limits" progress={56} compact>
      <span className="kids3-tag blue">PISTA 3</span>
      <h1>A conversa começou a incomodar.</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="✋" label="Parar, bloquear se preciso e pedir ajuda" selected={limitsAnswer === 'stop'} onClick={() => setLimitsAnswer('stop')} />
        <Choice icon="💬" label="Continuar respondendo por educação" selected={limitsAnswer === 'polite'} wrong={limitsAnswer === 'polite'} onClick={() => setLimitsAnswer('polite')} />
        <Choice icon="🧾" label="Mandar mais detalhes para explicar" selected={limitsAnswer === 'details'} wrong={limitsAnswer === 'details'} onClick={() => setLimitsAnswer('details')} />
      </div>
      {limitsAnswer && <div className={`kids3-feedback ${limitsAnswer === 'stop' ? 'good' : 'hint'}`}><b>{limitsAnswer === 'stop' ? 'Limite protegido! ✋' : 'Você pode parar.'}</b><p>Você não precisa continuar uma conversa que deixa você desconfortável.</p></div>}
      {limitsAnswer === 'stop' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('pressure')}>Continuar →</button>}
    </Scene>
  );

  if (screen === 'pressure') return (
    <Scene storyTitle={fifthKidsStory.title} src={fifthKidsStory.scenes.pressure} alt="Caio recebe um pedido de foto de um jogador desconhecido" screen="case005-pressure" progress={70} compact>
      <span className="kids3-tag blue">PRESSÃO</span>
      <h1>“Se você é meu amigo, manda uma foto!”</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="🤝" label="Dizer não, parar e avisar um adulto" selected={pressureAnswer === 'adult'} onClick={() => setPressureAnswer('adult')} />
        <Choice icon="📸" label="Mandar a foto para não perder o amigo" selected={pressureAnswer === 'photo'} wrong={pressureAnswer === 'photo'} onClick={() => setPressureAnswer('photo')} />
        <Choice icon="⚡" label="Mandar só uma foto rápida" selected={pressureAnswer === 'quick'} wrong={pressureAnswer === 'quick'} onClick={() => setPressureAnswer('quick')} />
      </div>
      {pressureAnswer && <div className={`kids3-feedback ${pressureAnswer === 'adult' ? 'good' : 'hint'}`}><b>{pressureAnswer === 'adult' ? 'Isso mesmo! 🛡️' : 'Amizade não pressiona.'}</b><p>Quem respeita você não exige foto, segredo ou informação pessoal.</p></div>}
      {pressureAnswer === 'adult' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('shield')}>Montar o escudo →</button>}
    </Scene>
  );

  if (screen === 'shield') return (
    <Scene storyTitle={fifthKidsStory.title} src={fifthKidsStory.scenes.shield} alt="Luna monta um escudo digital com hábitos para jogar com segurança" screen="case005-shield" progress={84} compact>
      <span className="kids3-tag blue">ESCUDO DO JOGADOR</span>
      <h1>Escolha 3 hábitos!</h1>
      <div className="kids3-choice-grid one tiny">
        {playerHabits.map(item => <Choice key={item.id} icon={item.icon} label={item.label} selected={habits.includes(item.id)} onClick={() => toggleHabit(item.id)} />)}
      </div>
      <div className="kids3-counter"><b>{habits.length}</b><span>/3 hábitos</span></div>
      {!habitsChecked && <button className="kids3-primary cyan" type="button" disabled={habits.length !== 3} onClick={() => setHabitsChecked(true)}>Ativar o escudo 🛡️</button>}
      {habitsChecked && !shieldSuccess && <div className="kids3-feedback hint"><b>O escudo ainda tem uma brecha.</b><p>Proteja seus dados, não ceda à pressão e peça ajuda.</p><button type="button" onClick={() => { setHabits([]); setHabitsChecked(false); }}>Tentar outra vez</button></div>}
      {habitsChecked && shieldSuccess && <><div className="kids3-feedback good"><b>Escudo completo! ✨</b></div><button className="kids3-primary cyan" type="button" onClick={() => setScreen('ending')}>Terminar a partida →</button></>}
    </Scene>
  );

  return (
    <Scene storyTitle={fifthKidsStory.title} src={fifthKidsStory.scenes.ending} alt="A turma comemora depois de bloquear o jogador desconhecido e continuar jogando com segurança" screen="case005-ending" progress={100} compact>
      <span className="kids3-tag blue">PARTIDA SEGURA</span>
      <h1>Missão cumprida!</h1>
      <p><b>Jogue. Proteja. Peça ajuda.</b></p>
      <div className="kids3-badges"><span>🎮<b>Jogador atento</b></span><span>🛡️<b>Dados protegidos</b></span><span>🤝<b>Ajuda quando precisa</b></span></div>
      <button className="kids3-primary cyan" type="button" onClick={reset}>Jogar de novo ↻</button>
      <button className="kids3-secondary" type="button" onClick={onExit}>Voltar ao catálogo</button>
    </Scene>
  );
}


function Case006Game({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Case006Screen>('warning');
  const [clueAnswer, setClueAnswer] = useState<'rush' | 'photo' | 'emoji' | null>(null);
  const [confirmAnswer, setConfirmAnswer] = useState<'other' | 'same' | 'profile' | null>(null);
  const [pauseAnswer, setPauseAnswer] = useState<'pause' | 'rush' | null>(null);
  const [riskAnswer, setRiskAnswer] = useState<'adult' | 'buy' | 'details' | null>(null);
  const [habits, setHabits] = useState<string[]>([]);
  const [habitsChecked, setHabitsChecked] = useState(false);
  const lighthouseSuccess = habits.length === 3 && habits.every(id => messageHabits.find(item => item.id === id)?.correct);

  function toggleHabit(id: string) {
    if (habitsChecked) return;
    setHabits(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current);
  }

  function reset() {
    setScreen('warning');
    setClueAnswer(null);
    setConfirmAnswer(null);
    setPauseAnswer(null);
    setRiskAnswer(null);
    setHabits([]);
    setHabitsChecked(false);
  }

  if (screen === 'warning') return (
    <Scene storyTitle={sixthKidsStory.title} src={sixthKidsStory.scenes.warning} alt="Luna recebe uma mensagem urgente que parece vir de alguém conhecido" screen="case006-warning" progress={14}>
      <span className="kids3-tag blue">MENSAGEM URGENTE</span>
      <h1>Tem algo estranho aqui.</h1>
      <p>A mensagem parece conhecida, mas o pedido não parece.</p>
      <div className="kids3-story-chip">💬 <b>Pare antes de obedecer a um pedido inesperado.</b></div>
      <button className="kids3-primary cyan" type="button" onClick={() => setScreen('clues')}>Investigar →</button>
    </Scene>
  );

  if (screen === 'clues') return (
    <Scene storyTitle={sixthKidsStory.title} src={sixthKidsStory.scenes.clues} alt="Maya encontra sinais de pressa, segredo e pedido incomum em uma mensagem" screen="case006-clues" progress={28} compact>
      <span className="kids3-tag blue">PISTA 1</span>
      <h1>Qual pista merece mais atenção?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="🚨" label="Pede segredo e pressa" selected={clueAnswer === 'rush'} onClick={() => setClueAnswer('rush')} />
        <Choice icon="🖼️" label="Tem uma foto conhecida" selected={clueAnswer === 'photo'} wrong={clueAnswer === 'photo'} onClick={() => setClueAnswer('photo')} />
        <Choice icon="🙂" label="Usa um emoji" selected={clueAnswer === 'emoji'} wrong={clueAnswer === 'emoji'} onClick={() => setClueAnswer('emoji')} />
      </div>
      {clueAnswer && <div className={`kids3-feedback ${clueAnswer === 'rush' ? 'good' : 'hint'}`}><b>{clueAnswer === 'rush' ? 'Boa! 🚨' : 'Olhe para o comportamento.'}</b><p>{clueAnswer === 'rush' ? 'Pressa e segredo podem ser usados para impedir você de conferir.' : 'Foto e emoji podem parecer familiares, mas não provam quem enviou.'}</p></div>}
      {clueAnswer === 'rush' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('confirm')}>Aprender a confirmar →</button>}
    </Scene>
  );

  if (screen === 'confirm') return (
    <Scene storyTitle={sixthKidsStory.title} src={sixthKidsStory.scenes.confirm} alt="Theo mostra um caminho independente para confirmar uma mensagem suspeita" screen="case006-confirm" progress={42} compact>
      <span className="kids3-tag blue">PISTA 2</span>
      <h1>Como confirmar de verdade?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="📞" label="Confirmar por outro caminho" selected={confirmAnswer === 'other'} onClick={() => setConfirmAnswer('other')} />
        <Choice icon="💬" label="Perguntar no mesmo chat" selected={confirmAnswer === 'same'} wrong={confirmAnswer === 'same'} onClick={() => setConfirmAnswer('same')} />
        <Choice icon="👤" label="Confiar na foto do perfil" selected={confirmAnswer === 'profile'} wrong={confirmAnswer === 'profile'} onClick={() => setConfirmAnswer('profile')} />
      </div>
      {confirmAnswer && <div className={`kids3-feedback ${confirmAnswer === 'other' ? 'good' : 'hint'}`}><b>{confirmAnswer === 'other' ? 'Isso! 🔎' : 'Use uma segunda rota.'}</b><p>{confirmAnswer === 'other' ? 'Ligue para um contato já salvo, fale pessoalmente ou peça ajuda a um adulto.' : 'O mesmo chat e a foto podem fazer parte da mensagem falsa.'}</p></div>}
      {confirmAnswer === 'other' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('pause')}>Continuar →</button>}
    </Scene>
  );

  if (screen === 'pause') return (
    <Scene storyTitle={sixthKidsStory.title} src={sixthKidsStory.scenes.pause} alt="Nina usa uma pausa antes de responder a uma mensagem urgente" screen="case006-pause" progress={56} compact>
      <span className="kids3-tag blue">PISTA 3</span>
      <h1>Urgência manda em você?</h1>
      <div className="kids3-choice-grid two">
        <Choice icon="⚡" label="Sim, respondo agora" selected={pauseAnswer === 'rush'} wrong={pauseAnswer === 'rush'} onClick={() => setPauseAnswer('rush')} />
        <Choice icon="⏸️" label="Não. Posso parar e conferir" selected={pauseAnswer === 'pause'} onClick={() => setPauseAnswer('pause')} />
      </div>
      {pauseAnswer && <div className={`kids3-feedback ${pauseAnswer === 'pause' ? 'good' : 'hint'}`}><b>{pauseAnswer === 'pause' ? 'Perfeito. ⏸️' : 'Pressa não decide por você.'}</b><p>Quem está com pressa ainda pode esperar você checar com segurança.</p></div>}
      {pauseAnswer === 'pause' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('risk')}>Continuar →</button>}
    </Scene>
  );

  if (screen === 'risk') return (
    <Scene storyTitle={sixthKidsStory.title} src={sixthKidsStory.scenes.risk} alt="Caio recebe um pedido inesperado de compra digital em uma mensagem" screen="case006-risk" progress={70} compact>
      <span className="kids3-tag blue">PEDIDO ESTRANHO</span>
      <h1>O pedido parece real. E agora?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="🤝" label="Parar e chamar um adulto para confirmar" selected={riskAnswer === 'adult'} onClick={() => setRiskAnswer('adult')} />
        <Choice icon="💳" label="Fazer logo para ajudar" selected={riskAnswer === 'buy'} wrong={riskAnswer === 'buy'} onClick={() => setRiskAnswer('buy')} />
        <Choice icon="💬" label="Responder pedindo mais detalhes" selected={riskAnswer === 'details'} wrong={riskAnswer === 'details'} onClick={() => setRiskAnswer('details')} />
      </div>
      {riskAnswer && <div className={`kids3-feedback ${riskAnswer === 'adult' ? 'good' : 'hint'}`}><b>{riskAnswer === 'adult' ? 'Boa escolha! 🛡️' : 'Não aja dentro da pressão.'}</b><p>Pedido de dinheiro ou compra precisa ser confirmado fora da mensagem.</p></div>}
      {riskAnswer === 'adult' && <button className="kids3-primary cyan" type="button" onClick={() => setScreen('lighthouse')}>Acender o farol →</button>}
    </Scene>
  );

  if (screen === 'lighthouse') return (
    <Scene storyTitle={sixthKidsStory.title} src={sixthKidsStory.scenes.lighthouse} alt="Luna monta o Farol da Verdade com três hábitos de segurança" screen="case006-lighthouse" progress={84} compact>
      <span className="kids3-tag blue">FAROL DA VERDADE</span>
      <h1>Escolha 3 hábitos!</h1>
      <div className="kids3-choice-grid one tiny">
        {messageHabits.map(item => <Choice key={item.id} icon={item.icon} label={item.label} selected={habits.includes(item.id)} onClick={() => toggleHabit(item.id)} />)}
      </div>
      <div className="kids3-counter"><b>{habits.length}</b><span>/3 hábitos</span></div>
      {!habitsChecked && <button className="kids3-primary cyan" type="button" disabled={habits.length !== 3} onClick={() => setHabitsChecked(true)}>Acender o Farol 🔦</button>}
      {habitsChecked && !lighthouseSuccess && <div className="kids3-feedback hint"><b>O farol ainda não acendeu.</b><p>Pare, confirme por outro caminho e peça ajuda.</p><button type="button" onClick={() => { setHabits([]); setHabitsChecked(false); }}>Tentar outra vez</button></div>}
      {habitsChecked && lighthouseSuccess && <><div className="kids3-feedback good"><b>Farol aceso! ✨</b></div><button className="kids3-primary cyan" type="button" onClick={() => setScreen('ending')}>Ver o resultado →</button></>}
    </Scene>
  );

  return (
    <Scene storyTitle={sixthKidsStory.title} src={sixthKidsStory.scenes.ending} alt="A turma comemora depois de descobrir a mensagem falsa com o Farol da Verdade" screen="case006-ending" progress={100} compact>
      <span className="kids3-tag blue">MISTÉRIO RESOLVIDO</span>
      <h1>Mensagem desmascarada!</h1>
      <p><b>Pare. Confirme. Peça ajuda.</b></p>
      <div className="kids3-badges"><span>👀<b>Olho atento</b></span><span>⏸️<b>Calma primeiro</b></span><span>🔎<b>Dupla checagem</b></span></div>
      <button className="kids3-primary cyan" type="button" onClick={reset}>Jogar de novo ↻</button>
      <button className="kids3-secondary" type="button" onClick={onExit}>Voltar ao catálogo</button>
    </Scene>
  );
}

export default function KidsStoryPrototype() {
  const [mode, setMode] = useState<AppMode>('library');
  const [gameId, setGameId] = useState<KidsGameId>('case-006');

  const chooseGame = useCallback((id: KidsGameId) => {
    setGameId(id);
    setMode('loading');
  }, []);
  const startGame = useCallback(() => setMode('playing'), []);
  const exitGame = useCallback(() => setMode('library'), []);

  const activeStory = gameId === 'case-006' ? sixthKidsStory : gameId === 'case-005' ? fifthKidsStory : gameId === 'case-004' ? fourthKidsStory : secondKidsStory;
  const activeAssets = gameId === 'case-006' ? case006Assets : gameId === 'case-005' ? case005Assets : gameId === 'case-004' ? case004Assets : case002Assets;

  return (
    <main className="kids-game kids3-root">
      {mode === 'library' && <GameLibrary onChoose={chooseGame} />}
      {mode === 'loading' && <LoadingCover story={activeStory} assets={activeAssets} onReady={startGame} />}
      {mode === 'playing' && (gameId === 'case-006' ? <Case006Game onExit={exitGame} /> : gameId === 'case-005' ? <Case005Game onExit={exitGame} /> : gameId === 'case-004' ? <Case004Game onExit={exitGame} /> : <Case002Game onExit={exitGame} />)}
    </main>
  );
}
