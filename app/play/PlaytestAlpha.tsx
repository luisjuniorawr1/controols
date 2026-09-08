"use client";

import { useMemo, useState } from "react";
import styles from "./play.module.css";
import { COLLECTION_001, getCollection001Card } from "@/src/tcg/cards/collection001";
import type { CardDefinition, LaneIndex, MatchState, UnitState } from "@/src/tcg/domain";
import { attackLane, beginCombat, endTurn, playCommand, playControolz } from "@/src/tcg/engine/duel";
import { createInitialMatchState, getOpponent, getPlayer } from "@/src/tcg/engine/match";
import { getSet001EffectiveAttack, getSet001EffectiveDefense } from "@/src/tcg/engine/set001-runtime";

const RAGE_CORE = [
  "SET001-0001", "SET001-0002", "SET001-0004", "SET001-0005",
  "SET001-0006", "SET001-0008", "SET001-0010", "SET001-0012",
  "SET001-0014", "SET001-0015", "SET001-0018", "SET001-0028",
] as const;

const PRIME_CORE = [
  "SET001-0146", "SET001-0147", "SET001-0150", "SET001-0151",
  "SET001-0152", "SET001-0154", "SET001-0155", "SET001-0158",
  "SET001-0160", "SET001-0161", "SET001-0168", "SET001-0174",
] as const;

const RAGE_DECK = [...RAGE_CORE, ...RAGE_CORE];
const PRIME_DECK = [...PRIME_CORE, ...PRIME_CORE];
const TUTORIAL_RAGE_CARD = "SET001-0001"; // Faísca Kira: 1 energia, 2/1, sem texto.
const TUTORIAL_PRIME_CARD = "SET001-0147"; // Placa Móvel: 1 energia, 0/4.
const TUTORIAL_LANE: LaneIndex = 1;

function cardById(id: string): CardDefinition {
  const card = getCollection001Card(id);
  if (!card) throw new Error(`Carta não encontrada: ${id}`);
  return card;
}

function unitCard(unit: UnitState): CardDefinition {
  return cardById(unit.definitionId);
}

function createAlphaMatch(): MatchState {
  return createInitialMatchState({
    matchId: `alpha-${Date.now()}`,
    playerAId: "RAGE",
    playerBId: "PRIME",
    playerADeck: RAGE_DECK,
    playerBDeck: PRIME_DECK,
    firstPlayerId: "RAGE",
    cardPoolVersion: "SET001-v1",
  });
}

function labelPlayer(id: string) {
  return id === "RAGE" ? "Controller RAGE" : "Controller PRIME";
}

function phaseLabel(phase: MatchState["phase"]) {
  if (phase === "CONTROL") return "1 · JOGAR CARTAS";
  if (phase === "COMBAT") return "2 · COMBATE";
  if (phase === "FINISHED") return "FIM";
  return phase;
}

function guideInstruction(step: number, activePlayerId: string) {
  switch (step) {
    case 1:
      return "1/8 · Toque na carta FAÍSCA KIRA na sua mão. O número ⚡ é o custo para jogá-la.";
    case 2:
      return "2/8 · Agora toque na LINHA 2 vazia. Isso coloca a Faísca Kira no campo.";
    case 3:
      return "3/8 · Ela acabou de entrar e ainda não pode atacar. Toque em ENCERRAR TURNO.";
    case 4:
      return "4/8 · PRIME: toque em PLACA MÓVEL. Ela custa 1 ⚡ e tem muita DEF.";
    case 5:
      return "5/8 · Coloque a PLACA MÓVEL também na LINHA 2, em frente à Faísca Kira.";
    case 6:
      return "6/8 · Agora encerre o turno de PRIME. Depois RAGE poderá atacar.";
    case 7:
      return "7/8 · RAGE: toque em IR PARA COMBATE. Jogar cartas e atacar são etapas separadas.";
    case 8:
      return "8/8 · Toque na FAÍSCA KIRA da LINHA 2. Ela atacará a carta que está diretamente à frente.";
    default:
      return activePlayerId === "RAGE" ? "Sua vez." : "Vez do outro Controller.";
  }
}

export default function PlaytestAlpha() {
  const [match, setMatch] = useState<MatchState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [handoff, setHandoff] = useState(false);
  const [message, setMessage] = useState("Escolha Aprender jogando para conhecer as regras enquanto joga.");
  const [history, setHistory] = useState<string[]>([]);
  const [guided, setGuided] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showLessonComplete, setShowLessonComplete] = useState(false);

  const active = useMemo(() => (match ? getPlayer(match, match.activePlayerId) : null), [match]);
  const opponent = useMemo(() => (match ? getOpponent(match, match.activePlayerId) : null), [match]);

  function pushHistory(text: string) {
    setHistory((current) => [text, ...current].slice(0, 8));
  }

  function start(mode: "GUIDED" | "FREE" = guided ? "GUIDED" : "FREE") {
    const isGuided = mode === "GUIDED";
    setMatch(createAlphaMatch());
    setSelectedCardId(null);
    setHandoff(false);
    setGuided(isGuided);
    setGuideStep(isGuided ? 0 : 99);
    setShowLessonComplete(false);
    setHistory(["Duelo iniciado: RAGE começa."]);
    setMessage(isGuided ? "Tutorial pronto. Primeiro vamos entender o objetivo." : "Sua vez: jogue cartas, depois entre em combate e encerre o turno.");
  }

  function reportPending(count: number) {
    if (count > 0) {
      setMessage(`Esta carta precisa de ${count} escolha adicional. O tutorial evita essas cartas no começo.`);
    }
  }

  function expectedTutorialCard() {
    if (!guided) return null;
    if (guideStep === 1) return TUTORIAL_RAGE_CARD;
    if (guideStep === 4) return TUTORIAL_PRIME_CARD;
    return null;
  }

  function selectHandCard(id: string) {
    if (!match || !active || match.phase !== "CONTROL") return;
    const expected = expectedTutorialCard();
    if (expected && id !== expected) {
      setMessage(`No tutorial, toque primeiro em ${cardById(expected).name}. Ela está destacada.`);
      return;
    }
    if (guided && ![1, 4].includes(guideStep)) {
      setMessage(guideInstruction(guideStep, active.playerId));
      return;
    }

    const card = cardById(id);
    if (card.type === "COMMAND") {
      try {
        const result = playCommand({ state: match, playerId: active.playerId, definitionId: id, catalogue: COLLECTION_001 });
        setMatch(result.state);
        setSelectedCardId(null);
        pushHistory(`${labelPlayer(active.playerId)} executou ${card.name}.`);
        reportPending(result.pendingEffects.length);
        if (!result.pendingEffects.length) setMessage(`${card.name} resolvido.`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Não foi possível executar o Comando.");
      }
      return;
    }

    setSelectedCardId(id === selectedCardId ? null : id);
    if (guided) {
      setGuideStep((current) => current + 1);
      setMessage(`Boa. Agora ${card.name} está selecionada. Toque na LINHA 2.`);
    } else {
      setMessage(id === selectedCardId ? "Seleção cancelada." : `Carta selecionada. Agora escolha uma linha vazia para conectar ${card.name}.`);
    }
  }

  function connectToLane(lane: LaneIndex) {
    if (!match || !active || !selectedCardId || match.phase !== "CONTROL") return;
    if (guided && [2, 5].includes(guideStep) && lane !== TUTORIAL_LANE) {
      setMessage("No tutorial, use a LINHA 2, que está destacada. Assim veremos o combate frente a frente.");
      return;
    }
    const card = cardById(selectedCardId);
    if (card.type !== "CONTROOLZ") return;
    try {
      const result = playControolz({
        state: match,
        playerId: active.playerId,
        definitionId: selectedCardId,
        lane,
        catalogue: COLLECTION_001,
      });
      setMatch(result.state);
      setSelectedCardId(null);
      pushHistory(`${labelPlayer(active.playerId)} conectou ${card.name} na linha ${lane + 1}.`);
      reportPending(result.pendingEffects.length);
      if (guided) {
        setGuideStep((current) => current + 1);
        setMessage(active.playerId === "RAGE" ? "Perfeito. Ela está em campo, mas só poderá atacar no seu próximo turno." : "Perfeito. As duas cartas estão frente a frente na Linha 2.");
      } else if (!result.pendingEffects.length) {
        setMessage(`${card.name} entrou em campo.`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível conectar a carta.");
    }
  }

  function enterCombat() {
    if (!match || !active) return;
    if (guided && guideStep !== 7) {
      setMessage(guideInstruction(guideStep, active.playerId));
      return;
    }
    try {
      setMatch(beginCombat(match, active.playerId));
      setSelectedCardId(null);
      if (guided) {
        setGuideStep(8);
        setMessage("Agora toque na Faísca Kira da Linha 2. Ela atacará a Placa Móvel que está em frente.");
      } else {
        setMessage("COMBATE: toque em um Controolz seu para ele atacar pela mesma linha.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível iniciar o combate.");
    }
  }

  function attack(lane: LaneIndex) {
    if (!match || !active || match.phase !== "COMBAT") return;
    if (guided && guideStep === 8 && lane !== TUTORIAL_LANE) {
      setMessage("No tutorial, ataque pela LINHA 2 tocando na Faísca Kira destacada.");
      return;
    }
    const attacker = active.board[lane];
    if (!attacker) return;
    try {
      const name = unitCard(attacker).name;
      const result = attackLane({ state: match, playerId: active.playerId, lane, catalogue: COLLECTION_001 });
      setMatch(result.state);
      pushHistory(`${name} atacou pela linha ${lane + 1}.`);
      reportPending(result.pendingEffects.length);
      if (guided && guideStep === 8) {
        setGuideStep(9);
        setGuided(false);
        setShowLessonComplete(true);
        setMessage("Tutorial concluído. Agora o duelo está livre.");
      } else if (!result.pendingEffects.length) {
        setMessage(`${name} resolveu o ataque.`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ataque inválido.");
    }
  }

  function finishTurn() {
    if (!match || !active) return;
    if (guided && ![3, 6].includes(guideStep)) {
      setMessage(guideInstruction(guideStep, active.playerId));
      return;
    }
    try {
      const next = endTurn(match, active.playerId, undefined, COLLECTION_001);
      setMatch(next);
      setSelectedCardId(null);
      if (!next.outcome) setHandoff(true);
      pushHistory(`${labelPlayer(active.playerId)} encerrou o turno.`);
      if (guided) {
        setGuideStep((current) => current + 1);
        setMessage("Passe o aparelho para o outro Controller.");
      } else {
        setMessage(next.outcome ? "Duelo encerrado." : "Passe o aparelho para o outro Controller.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível encerrar o turno.");
    }
  }

  if (!match || !active || !opponent) {
    return (
      <main className={styles.shell}>
        <section className={styles.intro}>
          <div className={styles.brand}>CONTR<span>OO</span>LZ</div>
          <span className={styles.eyebrow}>SET 001 · PLAYTEST ALPHA</span>
          <h1>Destrua a defesa. Abra a linha. Zere o SINAL.</h1>
          <p>Esse é o objetivo inteiro: cada Controller começa com <b>20 de SINAL</b>. Quando uma linha inimiga está vazia, seu Controolz pode causar dano direto ao SINAL. Quem chegar a 0 perde.</p>
          <div className={styles.simpleRules}>
            <article><b>⚡ ENERGIA</b><span>Paga o custo das cartas. Começa em 1 e aumenta a cada turno.</span></article>
            <article><b>⚔ ATQ</b><span>Quanto dano o Controolz causa quando ataca.</span></article>
            <article><b>🛡 DEF</b><span>Quanto dano o Controolz aguenta antes de ser destruído.</span></article>
            <article><b>📡 SINAL</b><span>A “vida” do Controller. Zere o SINAL adversário para vencer.</span></article>
          </div>
          <div className={styles.introActions}>
            <button className={styles.primaryButton} onClick={() => start("GUIDED")}>Aprender jogando · 3 min</button>
            <button className={styles.secondaryButton} onClick={() => start("FREE")}>Já sei · jogar livre</button>
          </div>
          <small>Modo hotseat: duas pessoas usam o mesmo aparelho e a mão fica escondida na troca de turno.</small>
        </section>
      </main>
    );
  }

  const winner = match.outcome?.winnerPlayerId;
  const tutorialTarget = expectedTutorialCard();

  return (
    <main className={styles.shell}>
      <div className={styles.game}>
        <header className={styles.topbar}>
          <div className={styles.brand}>CONTR<span>OO</span>LZ</div>
          <div className={styles.phase}>TURNO {match.turn} · {phaseLabel(match.phase)}</div>
          <div className={styles.topActions}>
            <button className={styles.ghostButton} onClick={() => setShowHelp(true)}>Como jogar?</button>
            <button className={styles.ghostButton} onClick={() => start(guided ? "GUIDED" : "FREE")}>Reiniciar</button>
          </div>
        </header>

        <section className={`${styles.coach} ${guided ? styles.coachGuided : ""}`}>
          <small>{guided ? "AGORA FAÇA ISTO" : "OBJETIVO"}</small>
          <strong>{guided ? guideInstruction(guideStep, active.playerId) : "Jogue cartas → entre em combate → ataque → encerre o turno. Zere o SINAL inimigo."}</strong>
        </section>

        <div className={styles.turnFlow} aria-label="Etapas do turno">
          <span className={match.phase === "CONTROL" ? styles.flowActive : ""}>1. JOGAR CARTAS</span>
          <i>→</i>
          <span className={match.phase === "COMBAT" ? styles.flowActive : ""}>2. COMBATER</span>
          <i>→</i>
          <span>3. ENCERRAR</span>
        </div>

        <section className={styles.playerHeader} data-side="opponent">
          <div><small>ADVERSÁRIO</small><strong>{labelPlayer(opponent.playerId)}</strong></div>
          <div className={styles.resources}><span title="SINAL do adversário">📡 {opponent.signal} SINAL</span><span>🂠 {opponent.hand.length} na mão</span></div>
        </section>

        <section className={styles.board} aria-label="Campo do adversário">
          {opponent.board.map((unit, lane) => (
            <BoardSlot key={`enemy-${lane}`} match={match} unit={unit} lane={lane as LaneIndex} enemy tutorialTarget={guided && guideStep >= 5 && lane === TUTORIAL_LANE} />
          ))}
        </section>

        <div className={styles.divider}><span>↑ CADA CARTA ATACA O QUE ESTÁ NA MESMA LINHA ↑</span></div>

        <section className={styles.board} aria-label="Seu campo">
          {active.board.map((unit, lane) => {
            const laneIndex = lane as LaneIndex;
            const tutorialLaneReady = guided && [2, 5].includes(guideStep) && laneIndex === TUTORIAL_LANE;
            const tutorialAttacker = guided && guideStep === 8 && laneIndex === TUTORIAL_LANE;
            return (
              <BoardSlot
                key={`self-${lane}`}
                match={match}
                unit={unit}
                lane={laneIndex}
                selected={(Boolean(selectedCardId) && !unit && (!guided || tutorialLaneReady)) || tutorialLaneReady}
                tutorialTarget={tutorialAttacker}
                onClick={() => unit ? attack(laneIndex) : connectToLane(laneIndex)}
              />
            );
          })}
        </section>

        <section className={styles.playerHeader} data-side="self">
          <div><small>SUA VEZ</small><strong>{labelPlayer(active.playerId)}</strong></div>
          <div className={styles.resources}><span title="Seu SINAL">📡 {active.signal} SINAL</span><span title="Energia disponível">⚡ {active.energy}/{active.maxEnergy} ENERGIA</span><span>🂠 {active.deck.length} no deck</span></div>
        </section>

        <section className={styles.status}><b>Feedback:</b> {message}</section>

        <section className={styles.actions}>
          {match.phase === "CONTROL" && (
            <button
              className={`${styles.secondaryButton} ${guided && guideStep === 7 ? styles.actionTarget : ""}`}
              onClick={enterCombat}
              disabled={guided && guideStep !== 7}
            >
              Ir para combate
            </button>
          )}
          <button
            className={`${styles.primaryButton} ${guided && [3, 6].includes(guideStep) ? styles.actionTarget : ""}`}
            onClick={finishTurn}
            disabled={guided && ![3, 6].includes(guideStep)}
          >
            Encerrar turno
          </button>
        </section>

        <section className={styles.handWrap}>
          <div className={styles.sectionTitle}><span>MINHA MÃO · TOQUE EM UMA CARTA PARA JOGAR</span><small>{active.hand.length} cartas</small></div>
          <div className={styles.hand}>
            {active.hand.map((id, index) => {
              const card = cardById(id);
              return (
                <HandCard
                  key={`${id}-${index}`}
                  card={card}
                  selected={selectedCardId === id}
                  tutorialTarget={tutorialTarget === id}
                  onClick={() => selectHandCard(id)}
                />
              );
            })}
          </div>
        </section>

        <section className={styles.legend}>
          <span><b>CONEXÃO</b> acontece quando a carta entra em campo.</span>
          <span><b>DESCONEXÃO</b> acontece quando ela é destruída.</span>
          <span><b>COMANDO</b> é uma carta de efeito: resolve e vai para o descarte.</span>
        </section>

        <section className={styles.history}>
          <div className={styles.sectionTitle}><span>O QUE ACONTECEU</span></div>
          {history.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)}
        </section>
      </div>

      {guided && guideStep === 0 && (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <span className={styles.eyebrow}>ANTES DA PRIMEIRA JOGADA</span>
            <h2>Você vence zerando o SINAL.</h2>
            <div className={styles.helpSteps}>
              <p><b>1.</b> Use ⚡ energia para colocar cartas no campo.</p>
              <p><b>2.</b> Cada Controolz ataca pela linha em que está.</p>
              <p><b>3.</b> Se houver inimigo na frente, eles lutam. Se a linha estiver vazia, você acerta o 📡 SINAL.</p>
              <p><b>4.</b> ⚔ ATQ causa dano. 🛡 DEF é a resistência da carta e o dano permanece.</p>
            </div>
            <button className={styles.primaryButton} onClick={() => { setGuideStep(1); setMessage("Toque na Faísca Kira destacada na sua mão."); }}>Começar tutorial</button>
          </div>
        </div>
      )}

      {showHelp && (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <span className={styles.eyebrow}>COMO JOGAR</span>
            <h2>O turno em três passos.</h2>
            <div className={styles.helpSteps}>
              <p><b>1 · JOGAR CARTAS</b><br/>Toque numa carta da mão. Se for Controolz, toque numa linha vazia. Você só pode pagar cartas cujo custo caiba na sua ⚡ energia.</p>
              <p><b>2 · COMBATE</b><br/>Toque em “Ir para combate” e depois numa carta sua. Ela ataca o que estiver na mesma linha.</p>
              <p><b>3 · ENCERRAR</b><br/>Passe o aparelho. No próximo turno sua energia máxima aumenta em 1, até 7.</p>
              <p><b>VITÓRIA</b><br/>Abra uma linha e ataque diretamente o adversário. Quem chegar a 📡 0 SINAL perde.</p>
            </div>
            <button className={styles.primaryButton} onClick={() => setShowHelp(false)}>Voltar ao jogo</button>
          </div>
        </div>
      )}

      {showLessonComplete && (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <span className={styles.eyebrow}>TUTORIAL CONCLUÍDO</span>
            <h2>Foi isso que aconteceu.</h2>
            <div className={styles.helpSteps}>
              <p>A <b>Faísca Kira</b> tem ⚔ 2 ATQ. Ela causou 2 de dano na 🛡 DEF da Placa Móvel.</p>
              <p>A <b>Placa Móvel</b> tem ⚔ 0 ATQ, então não causou dano de volta.</p>
              <p>O combate é <b>simultâneo</b>: quando duas cartas têm ATQ, as duas causam dano uma à outra.</p>
              <p>Se não existisse carta inimiga na Linha 2, os 2 de ATQ teriam atingido diretamente o 📡 <b>SINAL</b>.</p>
            </div>
            <button className={styles.primaryButton} onClick={() => setShowLessonComplete(false)}>Entendi · continuar duelo</button>
          </div>
        </div>
      )}

      {handoff && !winner && (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <span className={styles.eyebrow}>TROCA DE CONTROLLER</span>
            <h2>Passe o aparelho.</h2>
            <p>A mão do próximo jogador está escondida. Só toque no botão quando o aparelho estiver com ele.</p>
            <button className={styles.primaryButton} onClick={() => {
              setHandoff(false);
              setMessage(guided ? guideInstruction(guideStep, match.activePlayerId) : "Sua vez: jogue cartas, depois entre em combate.");
            }}>Sou {labelPlayer(match.activePlayerId)}</button>
          </div>
        </div>
      )}

      {match.outcome && (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <span className={styles.eyebrow}>CONEXÃO ENCERRADA</span>
            <h2>{winner ? `${labelPlayer(winner)} venceu.` : "Empate."}</h2>
            <p>O SINAL chegou a zero.</p>
            <button className={styles.primaryButton} onClick={() => start("FREE")}>Jogar novamente</button>
          </div>
        </div>
      )}
    </main>
  );
}

function HandCard({ card, selected, tutorialTarget, onClick }: { card: CardDefinition; selected: boolean; tutorialTarget?: boolean; onClick: () => void }) {
  return (
    <button className={`${styles.card} ${styles[`class${card.cardClass}`]} ${selected ? styles.selectedCard : ""} ${tutorialTarget ? styles.tutorialTarget : ""}`} onClick={onClick}>
      <div className={styles.cardTop}><span className={styles.cost}>⚡{card.cost}</span><small>{card.type === "COMMAND" ? "COMANDO" : card.cardClass}</small></div>
      <strong>{card.name}</strong>
      <p>{card.rulesText || "Sem habilidade: vale apenas pelos atributos."}</p>
      {card.type === "CONTROOLZ" && <div className={styles.stats}><span title="Ataque">⚔ {card.attack} ATQ</span><span title="Defesa">🛡 {card.defense} DEF</span></div>}
    </button>
  );
}

function BoardSlot({ match, unit, lane, enemy = false, selected = false, tutorialTarget = false, onClick }: { match: MatchState; unit: UnitState | null; lane: LaneIndex; enemy?: boolean; selected?: boolean; tutorialTarget?: boolean; onClick?: () => void }) {
  if (!unit) {
    return <button className={`${styles.slot} ${selected ? styles.slotReady : ""} ${tutorialTarget ? styles.tutorialTarget : ""}`} onClick={onClick} disabled={!onClick}><small>LINHA {lane + 1}</small><span>{selected ? "+ COLOCAR AQUI" : "VAZIA"}</span></button>;
  }
  const card = unitCard(unit);
  const attack = getSet001EffectiveAttack(match, unit, COLLECTION_001);
  const defense = getSet001EffectiveDefense(match, unit, COLLECTION_001);
  return (
    <button className={`${styles.unit} ${styles[`class${card.cardClass}`]} ${enemy ? styles.enemyUnit : ""} ${tutorialTarget ? styles.tutorialTarget : ""}`} onClick={onClick} disabled={!onClick}>
      <div className={styles.cardTop}><small>LINHA {lane + 1}</small><small>{card.cardClass}</small></div>
      <strong>{card.name}</strong>
      <p>{card.rulesText || "Sem habilidade."}</p>
      <div className={styles.stats}><span>⚔ {attack} ATQ</span><span>🛡 {defense} DEF</span></div>
      {!enemy && match.phase === "COMBAT" && <em>TOQUE PARA ATACAR ↑</em>}
    </button>
  );
}
