'use client';

import { useState } from 'react';
import { superKidsStory } from '@/src/game/kidsStory';

type ChoiceProps = {
  icon?: string;
  label: string;
  selected?: boolean;
  wrong?: boolean;
  onClick: () => void;
};

function Choice({ icon, label, selected, wrong, onClick }: ChoiceProps) {
  return (
    <button
      type="button"
      className={`kids3-choice${selected ? ' is-selected' : ''}${wrong ? ' is-wrong' : ''}`}
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
    <section className="kids3-scene super001-scene" data-screen={screen}>
      <img className="kids3-scene-art" src={src} alt={alt} />
      <aside className={`kids3-panel${compact ? ' is-compact' : ''}`}>
        <div className="kids3-panel-meta">
          <span>SUPER AVENTURA</span>
          <small>{superKidsStory.title}</small>
        </div>
        <div className="kids3-progress" aria-label={`Progresso ${progress}%`}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <div className="kids3-panel-body">{children}</div>
      </aside>
    </section>
  );
}

type Step =
  | 'blackout'
  | 'lantern'
  | 'cable'
  | 'backpack'
  | 'map'
  | 'interruption'
  | 'objects'
  | 'priorities'
  | 'priorityChoice'
  | 'waste'
  | 'reserve'
  | 'neighborhood'
  | 'team'
  | 'plan'
  | 'lighting'
  | 'ending';

const progress: Record<Step, number> = {
  blackout: 6,
  lantern: 12,
  cable: 18,
  backpack: 25,
  map: 31,
  interruption: 37,
  objects: 43,
  priorities: 50,
  priorityChoice: 56,
  waste: 62,
  reserve: 68,
  neighborhood: 75,
  team: 81,
  plan: 87,
  lighting: 94,
  ending: 100,
};

export default function Super001Game({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState<Step>('blackout');
  const [answer, setAnswer] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const go = (next: Step) => {
    setAnswer(null);
    setSelected([]);
    setChecked(false);
    setStep(next);
  };

  const reset = () => go('blackout');

  const toggle = (id: string, max: number) => {
    if (checked) return;
    setSelected(current => current.includes(id) ? current.filter(item => item !== id) : current.length < max ? [...current, id] : current);
  };

  if (step === 'blackout') return (
    <Scene src={superKidsStory.scenes.blackout} alt="A turma dentro do clubhouse no momento do apagão durante a tempestade" screen="super001-blackout" progress={progress.blackout}>
      <span className="kids3-tag blue">CAPÍTULO 1 · O APAGÃO</span>
      <h1>A cidade apagou!</h1>
      <p>Antes de investigar, qual é a melhor primeira atitude?</p>
      <div className="kids3-choice-grid one">
        <Choice icon="🔦" label="Ficar junto e procurar uma luz segura" selected={answer === 'safe'} onClick={() => setAnswer('safe')} />
        <Choice icon="🏃" label="Sair correndo no escuro" selected={answer === 'run'} wrong={answer === 'run'} onClick={() => setAnswer('run')} />
        <Choice icon="🔥" label="Acender qualquer chama" selected={answer === 'fire'} wrong={answer === 'fire'} onClick={() => setAnswer('fire')} />
      </div>
      {answer && <div className={`kids3-feedback ${answer === 'safe' ? 'good' : 'hint'}`}><b>{answer === 'safe' ? 'Boa decisão! ⭐' : 'Segurança primeiro.'}</b><p>{answer === 'safe' ? 'No escuro, a turma fica junta e procura uma fonte de luz segura.' : 'Correr ou usar chama pode criar novos riscos.'}</p></div>}
      {answer === 'safe' && <button className="kids3-primary cyan" type="button" onClick={() => go('lantern')}>Encontrar uma luz →</button>}
    </Scene>
  );

  if (step === 'lantern') return (
    <Scene src={superKidsStory.scenes.lantern} alt="Uma lanterna ilumina o clubhouse durante o apagão" screen="super001-lantern" progress={progress.lantern} compact>
      <span className="kids3-tag blue">LUZ SEGURA</span>
      <h1>Qual luz escolher?</h1>
      <div className="kids3-choice-grid two">
        <Choice icon="🔦" label="Lanterna" selected={answer === 'flashlight'} onClick={() => setAnswer('flashlight')} />
        <Choice icon="🕯️" label="Vela perto das coisas" selected={answer === 'candle'} wrong={answer === 'candle'} onClick={() => setAnswer('candle')} />
      </div>
      {answer && <div className={`kids3-feedback ${answer === 'flashlight' ? 'good' : 'hint'}`}><b>{answer === 'flashlight' ? 'Isso! 🔦' : 'Melhor evitar.'}</b><p>Uma lanterna ilumina sem criar o risco de uma chama aberta.</p></div>}
      {answer === 'flashlight' && <button className="kids3-primary cyan" type="button" onClick={() => go('cable')}>Olhar lá fora →</button>}
    </Scene>
  );

  if (step === 'cable') return (
    <Scene src={superKidsStory.scenes.cable} alt="A turma observa à distância um fio elétrico caído depois da tempestade" screen="super001-cable" progress={progress.cable} compact>
      <span className="kids3-tag blue">PISTA DE SEGURANÇA</span>
      <h1>Um fio caiu na rua. E agora?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="↔️" label="Manter distância e avisar um adulto" selected={answer === 'distance'} onClick={() => setAnswer('distance')} />
        <Choice icon="🖐️" label="Chegar perto para olhar" selected={answer === 'near'} wrong={answer === 'near'} onClick={() => setAnswer('near')} />
        <Choice icon="🛠️" label="Tentar consertar" selected={answer === 'fix'} wrong={answer === 'fix'} onClick={() => setAnswer('fix')} />
      </div>
      {answer && <div className={`kids3-feedback ${answer === 'distance' ? 'good' : 'hint'}`}><b>{answer === 'distance' ? 'Perfeito. 🛡️' : 'Não se aproxime.'}</b><p>Fios caídos podem ser perigosos mesmo quando parecem desligados.</p></div>}
      {answer === 'distance' && <button className="kids3-primary cyan" type="button" onClick={() => go('backpack')}>Preparar a mochila →</button>}
    </Scene>
  );

  if (step === 'backpack') {
    const correct = ['flashlight', 'water', 'radio'];
    const success = checked && selected.length === 3 && selected.every(item => correct.includes(item));
    return (
      <Scene src={superKidsStory.scenes.backpack} alt="Mochila de emergência sendo preparada no clubhouse" screen="super001-backpack" progress={progress.backpack} compact>
        <span className="kids3-tag blue">MOCHILA DE EMERGÊNCIA</span>
        <h1>Escolha 3 itens úteis.</h1>
        <div className="kids3-choice-grid one tiny">
          <Choice icon="🔦" label="Lanterna" selected={selected.includes('flashlight')} onClick={() => toggle('flashlight', 3)} />
          <Choice icon="💧" label="Água" selected={selected.includes('water')} onClick={() => toggle('water', 3)} />
          <Choice icon="📻" label="Rádio ou celular carregado" selected={selected.includes('radio')} onClick={() => toggle('radio', 3)} />
          <Choice icon="🎮" label="Videogame" selected={selected.includes('game')} onClick={() => toggle('game', 3)} />
          <Choice icon="⚽" label="Bola" selected={selected.includes('ball')} onClick={() => toggle('ball', 3)} />
        </div>
        <div className="kids3-counter"><b>{selected.length}</b><span>/3 itens</span></div>
        {!checked && <button className="kids3-primary cyan" type="button" disabled={selected.length !== 3} onClick={() => setChecked(true)}>Conferir mochila</button>}
        {checked && !success && <div className="kids3-feedback hint"><b>Falta algo essencial.</b><p>Pense em luz, hidratação e comunicação.</p><button type="button" onClick={() => { setSelected([]); setChecked(false); }}>Tentar outra vez</button></div>}
        {success && <><div className="kids3-feedback good"><b>Mochila pronta! 🎒</b></div><button className="kids3-primary cyan" type="button" onClick={() => go('map')}>Investigar a energia →</button></>}
      </Scene>
    );
  }

  if (step === 'map') return (
    <Scene src={superKidsStory.scenes.map} alt="Mapa holográfico mostra como a energia percorre a cidade" screen="super001-map" progress={progress.map}>
      <span className="kids3-tag blue">CAPÍTULO 2 · COMO A ENERGIA VIAJA</span>
      <h1>A cidade tem caminhos de energia.</h1>
      <p>O mapa mostra que bairros e serviços dependem de uma rede conectada. Se um caminho falha, parte da cidade pode ficar sem energia.</p>
      <div className="kids3-story-chip">⚡ <b>Energia precisa chegar até onde é necessária.</b></div>
      <button className="kids3-primary cyan" type="button" onClick={() => go('interruption')}>Procurar a falha →</button>
    </Scene>
  );

  if (step === 'interruption') return (
    <Scene src={superKidsStory.scenes.interruption} alt="Mapa holográfico mostra um caminho de energia interrompido" screen="super001-interruption" progress={progress.interruption} compact>
      <span className="kids3-tag blue">PISTA DA REDE</span>
      <h1>O que o mapa está mostrando?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="⚡" label="Uma rota de energia foi interrompida" selected={answer === 'broken'} onClick={() => setAnswer('broken')} />
        <Choice icon="🎨" label="Só mudou a cor do mapa" selected={answer === 'color'} wrong={answer === 'color'} onClick={() => setAnswer('color')} />
        <Choice icon="🌙" label="A cidade decidiu dormir" selected={answer === 'sleep'} wrong={answer === 'sleep'} onClick={() => setAnswer('sleep')} />
      </div>
      {answer && <div className={`kids3-feedback ${answer === 'broken' ? 'good' : 'hint'}`}><b>{answer === 'broken' ? 'Pista encontrada! ⚡' : 'Observe as conexões.'}</b><p>Uma interrupção na rede pode deixar vários lugares sem energia.</p></div>}
      {answer === 'broken' && <button className="kids3-primary cyan" type="button" onClick={() => go('objects')}>Ver quem usa energia →</button>}
    </Scene>
  );

  if (step === 'objects') return (
    <Scene src={superKidsStory.scenes.objects} alt="Objetos do clubhouse ajudam a comparar o que depende de eletricidade" screen="super001-objects" progress={progress.objects} compact>
      <span className="kids3-tag blue">DESAFIO DA ENERGIA</span>
      <h1>Qual precisa de eletricidade para funcionar?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="💡" label="Lâmpada" selected={answer === 'lamp'} onClick={() => setAnswer('lamp')} />
        <Choice icon="📖" label="Livro" selected={answer === 'book'} wrong={answer === 'book'} onClick={() => setAnswer('book')} />
        <Choice icon="⚽" label="Bola" selected={answer === 'ball'} wrong={answer === 'ball'} onClick={() => setAnswer('ball')} />
      </div>
      {answer && <div className={`kids3-feedback ${answer === 'lamp' ? 'good' : 'hint'}`}><b>{answer === 'lamp' ? 'Acendeu! 💡' : 'Esse funciona sem tomada.'}</b><p>Nem tudo depende de eletricidade. Isso ajuda a entender onde podemos economizar.</p></div>}
      {answer === 'lamp' && <button className="kids3-primary cyan" type="button" onClick={() => go('priorities')}>Definir prioridades →</button>}
    </Scene>
  );

  if (step === 'priorities') return (
    <Scene src={superKidsStory.scenes.priorities} alt="Mapa da cidade destaca posto de saúde, abrigo, cruzamento e outros locais" screen="super001-priorities" progress={progress.priorities}>
      <span className="kids3-tag blue">CAPÍTULO 3 · QUEM PRECISA PRIMEIRO?</span>
      <h1>Nem todo lugar tem a mesma urgência.</h1>
      <p>Quando a energia é limitada, a turma precisa pensar em segurança, saúde e pessoas que precisam de ajuda.</p>
      <button className="kids3-primary cyan" type="button" onClick={() => go('priorityChoice')}>Escolher prioridades →</button>
    </Scene>
  );

  if (step === 'priorityChoice') {
    const correct = ['health', 'crossing', 'shelter'];
    const success = checked && selected.length === 3 && selected.every(item => correct.includes(item));
    return (
      <Scene src={superKidsStory.scenes.priorityChoice} alt="Três regiões prioritárias da cidade começam a receber energia" screen="super001-priority-choice" progress={progress.priorityChoice} compact>
        <span className="kids3-tag blue">MISSÃO DE PRIORIDADES</span>
        <h1>Escolha 3 lugares primeiro.</h1>
        <div className="kids3-choice-grid one tiny">
          <Choice icon="🏥" label="Posto de saúde" selected={selected.includes('health')} onClick={() => toggle('health', 3)} />
          <Choice icon="🚦" label="Cruzamento" selected={selected.includes('crossing')} onClick={() => toggle('crossing', 3)} />
          <Choice icon="🏠" label="Abrigo comunitário" selected={selected.includes('shelter')} onClick={() => toggle('shelter', 3)} />
          <Choice icon="🎡" label="Parque" selected={selected.includes('park')} onClick={() => toggle('park', 3)} />
          <Choice icon="✨" label="Letreiro decorativo" selected={selected.includes('sign')} onClick={() => toggle('sign', 3)} />
        </div>
        {!checked && <button className="kids3-primary cyan" type="button" disabled={selected.length !== 3} onClick={() => setChecked(true)}>Enviar energia</button>}
        {checked && !success && <div className="kids3-feedback hint"><b>Podemos priorizar melhor.</b><p>Pense em saúde, segurança no trânsito e abrigo.</p><button type="button" onClick={() => { setSelected([]); setChecked(false); }}>Tentar outra vez</button></div>}
        {success && <><div className="kids3-feedback good"><b>Prioridades certas! 🌟</b></div><button className="kids3-primary cyan" type="button" onClick={() => go('waste')}>Caçar desperdícios →</button></>}
      </Scene>
    );
  }

  if (step === 'waste') return (
    <Scene src={superKidsStory.scenes.waste} alt="Caio procura aparelhos ligados sem necessidade durante o apagão" screen="super001-waste" progress={progress.waste} compact>
      <span className="kids3-tag blue">CAPÍTULO 4 · ENERGIA NÃO É INFINITA</span>
      <h1>Onde há desperdício?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="📺" label="Aparelho ligado sem ninguém usando" selected={answer === 'unused'} onClick={() => setAnswer('unused')} />
        <Choice icon="🔦" label="Lanterna usada para enxergar" selected={answer === 'flashlight'} wrong={answer === 'flashlight'} onClick={() => setAnswer('flashlight')} />
        <Choice icon="🏥" label="Energia do posto de saúde" selected={answer === 'health'} wrong={answer === 'health'} onClick={() => setAnswer('health')} />
      </div>
      {answer && <div className={`kids3-feedback ${answer === 'unused' ? 'good' : 'hint'}`}><b>{answer === 'unused' ? 'Desperdício encontrado! 🔎' : 'Esse uso tem uma função.'}</b><p>Economizar é desligar o que não está sendo usado, sem tirar energia do que é importante.</p></div>}
      {answer === 'unused' && <button className="kids3-primary cyan" type="button" onClick={() => go('reserve')}>Ver a reserva →</button>}
    </Scene>
  );

  if (step === 'reserve') return (
    <Scene src={superKidsStory.scenes.reserve} alt="Caio observa uma reserva de energia parcialmente cheia" screen="super001-reserve" progress={progress.reserve} compact>
      <span className="kids3-tag blue">RESERVA DE ENERGIA</span>
      <h1>Usar tudo agora?</h1>
      <div className="kids3-choice-grid two">
        <Choice icon="🛡️" label="Guardar parte para necessidades essenciais" selected={answer === 'save'} onClick={() => setAnswer('save')} />
        <Choice icon="⚡" label="Gastar tudo de uma vez" selected={answer === 'all'} wrong={answer === 'all'} onClick={() => setAnswer('all')} />
      </div>
      {answer && <div className={`kids3-feedback ${answer === 'save' ? 'good' : 'hint'}`}><b>{answer === 'save' ? 'Boa gestão! 🔋' : 'A reserva pode acabar.'}</b><p>Quando o recurso é limitado, guardar parte ajuda a manter serviços importantes funcionando.</p></div>}
      {answer === 'save' && <button className="kids3-primary cyan" type="button" onClick={() => go('neighborhood')}>Olhar a cidade →</button>}
    </Scene>
  );

  if (step === 'neighborhood') return (
    <Scene src={superKidsStory.scenes.neighborhood} alt="Luna percebe que um bairro ainda permanece apagado" screen="super001-neighborhood" progress={progress.neighborhood}>
      <span className="kids3-tag blue">CAPÍTULO 5 · JUNTOS FUNCIONA MELHOR</span>
      <h1>Ainda falta um lugar!</h1>
      <p>Boa parte da cidade voltou, mas um bairro continua escuro. Uma pessoa sozinha não consegue resolver tudo.</p>
      <div className="kids3-story-chip">🤝 <b>Vamos precisar de toda a equipe.</b></div>
      <button className="kids3-primary cyan" type="button" onClick={() => go('team')}>Reunir a turma →</button>
    </Scene>
  );

  if (step === 'team') return (
    <Scene src={superKidsStory.scenes.team} alt="Os cinco amigos combinam suas habilidades diante do mapa da missão" screen="super001-team" progress={progress.team} compact>
      <span className="kids3-tag blue">TRABALHO EM EQUIPE</span>
      <h1>Qual é o melhor plano?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="🤝" label="Juntar habilidades diferentes" selected={answer === 'together'} onClick={() => setAnswer('together')} />
        <Choice icon="🏃" label="Cada um fazer tudo sozinho" selected={answer === 'alone'} wrong={answer === 'alone'} onClick={() => setAnswer('alone')} />
        <Choice icon="🎲" label="Escolher qualquer ideia sem conversar" selected={answer === 'random'} wrong={answer === 'random'} onClick={() => setAnswer('random')} />
      </div>
      {answer && <div className={`kids3-feedback ${answer === 'together' ? 'good' : 'hint'}`}><b>{answer === 'together' ? 'Equipe completa! 🤝' : 'Conversem primeiro.'}</b><p>Diferentes habilidades podem formar uma solução melhor do que uma única ideia.</p></div>}
      {answer === 'together' && <button className="kids3-primary cyan" type="button" onClick={() => go('plan')}>Montar o Plano da Luz →</button>}
    </Scene>
  );

  if (step === 'plan') return (
    <Scene src={superKidsStory.scenes.plan} alt="A turma reúne os símbolos de pessoas, folha e energia no Plano da Luz" screen="super001-plan" progress={progress.plan} compact>
      <span className="kids3-tag blue">PLANO DA LUZ</span>
      <h1>Qual princípio junta a missão toda?</h1>
      <div className="kids3-choice-grid one">
        <Choice icon="🤝" label="Cuidar das pessoas, usar só o necessário e cooperar" selected={answer === 'balanced'} onClick={() => setAnswer('balanced')} />
        <Choice icon="✨" label="Iluminar primeiro o que fica mais bonito" selected={answer === 'pretty'} wrong={answer === 'pretty'} onClick={() => setAnswer('pretty')} />
        <Choice icon="⚡" label="Usar toda a energia sem planejar" selected={answer === 'spend'} wrong={answer === 'spend'} onClick={() => setAnswer('spend')} />
      </div>
      {answer && <div className={`kids3-feedback ${answer === 'balanced' ? 'good' : 'hint'}`}><b>{answer === 'balanced' ? 'Plano completo! 🌱⚡🤝' : 'Pense na missão inteira.'}</b><p>Prioridade, consumo consciente e cooperação fazem a energia chegar melhor a todos.</p></div>}
      {answer === 'balanced' && <button className="kids3-primary cyan" type="button" onClick={() => go('lighting')}>Acender a cidade →</button>}
    </Scene>
  );

  if (step === 'lighting') return (
    <Scene src={superKidsStory.scenes.lighting} alt="A cidade recupera energia gradualmente, com ruas e serviços voltando a acender" screen="super001-lighting" progress={progress.lighting}>
      <span className="kids3-tag blue">A CIDADE ESTÁ VOLTANDO</span>
      <h1>Olha só!</h1>
      <p>Primeiro os serviços importantes, depois os bairros e as ruas. A recuperação acontece aos poucos — sem desperdiçar a reserva.</p>
      <div className="kids3-story-chip">✨ <b>Planejar fez a diferença.</b></div>
      <button className="kids3-primary cyan" type="button" onClick={() => go('ending')}>Ver o amanhecer →</button>
    </Scene>
  );

  return (
    <Scene src={superKidsStory.scenes.ending} alt="Os cinco amigos observam a cidade iluminada enquanto a tempestade termina" screen="super001-ending" progress={progress.ending} compact>
      <span className="kids3-tag blue">SUPER MISSÃO CUMPRIDA</span>
      <h1>A cidade voltou a brilhar!</h1>
      <p><b>Segurança. Prioridade. Consciência. Equipe.</b></p>
      <div className="kids3-badges"><span>🔦<b>Pronto para emergências</b></span><span>⚡<b>Energia consciente</b></span><span>🤝<b>Força da equipe</b></span></div>
      <button className="kids3-primary cyan" type="button" onClick={reset}>Jogar de novo ↻</button>
      <button className="kids3-secondary" type="button" onClick={onExit}>Voltar ao catálogo</button>
    </Scene>
  );
}
