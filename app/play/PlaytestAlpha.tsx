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

export default function PlaytestAlpha() {
  const [match, setMatch] = useState<MatchState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [handoff, setHandoff] = useState(false);
  const [message, setMessage] = useState("Playtest local: dois jogadores usando o mesmo aparelho.");
  const [history, setHistory] = useState<string[]>([]);

  const active = useMemo(() => (match ? getPlayer(match, match.activePlayerId) : null), [match]);
  const opponent = useMemo(() => (match ? getOpponent(match, match.activePlayerId) : null), [match]);

  function pushHistory(text: string) {
    setHistory((current) => [text, ...current].slice(0, 8));
  }

  function start() {
    setMatch(createAlphaMatch());
    setSelectedCardId(null);
    setHandoff(false);
    setHistory(["Duelo iniciado: RAGE começa."]);
    setMessage("Fase CONTROLE: conecte um Controolz ou use um Comando.");
  }

  function reportPending(count: number) {
    if (count > 0) {
      setMessage(`A engine pediu ${count} decisão(ões) adicional(is). Este deck Alpha evita a maioria desses casos.`);
    }
  }

  function selectHandCard(id: string) {
    if (!match || !active || match.phase !== "CONTROL") return;
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
    setMessage(id === selectedCardId ? "Seleção cancelada." : `Escolha uma linha vazia para conectar ${card.name}.`);
  }

  function connectToLane(lane: LaneIndex) {
    if (!match || !active || !selectedCardId || match.phase !== "CONTROL") return;
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
      if (!result.pendingEffects.length) setMessage(`${card.name} entrou em campo.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível conectar a carta.");
    }
  }

  function enterCombat() {
    if (!match || !active) return;
    try {
      setMatch(beginCombat(match, active.playerId));
      setSelectedCardId(null);
      setMessage("Fase COMBATE: toque em um Controolz seu para atacar pela linha dele.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível iniciar o combate.");
    }
  }

  function attack(lane: LaneIndex) {
    if (!match || !active || match.phase !== "COMBAT") return;
    const attacker = active.board[lane];
    if (!attacker) return;
    try {
      const name = unitCard(attacker).name;
      const result = attackLane({ state: match, playerId: active.playerId, lane, catalogue: COLLECTION_001 });
      setMatch(result.state);
      pushHistory(`${name} atacou pela linha ${lane + 1}.`);
      reportPending(result.pendingEffects.length);
      if (!result.pendingEffects.length) setMessage(`${name} resolveu o ataque.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ataque inválido.");
    }
  }

  function finishTurn() {
    if (!match || !active) return;
    try {
      const next = endTurn(match, active.playerId, undefined, COLLECTION_001);
      setMatch(next);
      setSelectedCardId(null);
      if (!next.outcome) setHandoff(true);
      pushHistory(`${labelPlayer(active.playerId)} encerrou o turno.`);
      setMessage(next.outcome ? "Duelo encerrado." : "Passe o aparelho para o outro Controller.");
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
          <h1>Primeiro duelo jogável.</h1>
          <p>Uma versão enxuta para testar SINAL, energia, três linhas, combate, CONEXÃO, DESCONEXÃO e alguns Comandos sem depender da arte final das cartas.</p>
          <div className={styles.rulesGrid}>
            <div><b>20</b><span>SINAL</span></div>
            <div><b>3</b><span>LINHAS</span></div>
            <div><b>1→7</b><span>ENERGIA</span></div>
            <div><b>24</b><span>CARTAS/DECK</span></div>
          </div>
          <button className={styles.primaryButton} onClick={start}>Iniciar RAGE × PRIME</button>
          <small>Modo hotseat: ao terminar o turno, a tela bloqueia a mão antes de passar o aparelho.</small>
        </section>
      </main>
    );
  }

  const winner = match.outcome?.winnerPlayerId;

  return (
    <main className={styles.shell}>
      <div className={styles.game}>
        <header className={styles.topbar}>
          <div className={styles.brand}>CONTR<span>OO</span>LZ</div>
          <div className={styles.phase}>TURNO {match.turn} · {match.phase}</div>
          <button className={styles.ghostButton} onClick={start}>Reiniciar</button>
        </header>

        <section className={styles.playerHeader} data-side="opponent">
          <div><small>ADVERSÁRIO</small><strong>{labelPlayer(opponent.playerId)}</strong></div>
          <div className={styles.resources}><span>📡 {opponent.signal}</span><span>⚡ {opponent.energy}/{opponent.maxEnergy}</span><span>🂠 {opponent.hand.length}</span></div>
        </section>

        <section className={styles.board} aria-label="Campo do adversário">
          {opponent.board.map((unit, lane) => (
            <BoardSlot key={`enemy-${lane}`} match={match} unit={unit} lane={lane as LaneIndex} enemy />
          ))}
        </section>

        <div className={styles.divider}><span>LINHAS DE CONTROLE</span></div>

        <section className={styles.board} aria-label="Seu campo">
          {active.board.map((unit, lane) => (
            <BoardSlot
              key={`self-${lane}`}
              match={match}
              unit={unit}
              lane={lane as LaneIndex}
              selected={Boolean(selectedCardId) && !unit}
              onClick={() => unit ? attack(lane as LaneIndex) : connectToLane(lane as LaneIndex)}
            />
          ))}
        </section>

        <section className={styles.playerHeader} data-side="self">
          <div><small>SUA VEZ</small><strong>{labelPlayer(active.playerId)}</strong></div>
          <div className={styles.resources}><span>📡 {active.signal}</span><span>⚡ {active.energy}/{active.maxEnergy}</span><span>🂠 {active.deck.length}</span></div>
        </section>

        <section className={styles.status}>{message}</section>

        <section className={styles.actions}>
          {match.phase === "CONTROL" && <button className={styles.secondaryButton} onClick={enterCombat}>Ir para combate</button>}
          <button className={styles.primaryButton} onClick={finishTurn}>Encerrar turno</button>
        </section>

        <section className={styles.handWrap}>
          <div className={styles.sectionTitle}><span>MINHA MÃO</span><small>{active.hand.length} cartas</small></div>
          <div className={styles.hand}>
            {active.hand.map((id, index) => {
              const card = cardById(id);
              return <HandCard key={`${id}-${index}`} card={card} selected={selectedCardId === id} onClick={() => selectHandCard(id)} />;
            })}
          </div>
        </section>

        <section className={styles.history}>
          <div className={styles.sectionTitle}><span>HISTÓRICO</span></div>
          {history.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)}
        </section>
      </div>

      {handoff && !winner && (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <span className={styles.eyebrow}>TROCA DE CONTROLLER</span>
            <h2>Passe o aparelho.</h2>
            <p>A mão do próximo jogador está escondida.</p>
            <button className={styles.primaryButton} onClick={() => { setHandoff(false); setMessage("Fase CONTROLE: conecte um Controolz ou use um Comando."); }}>Sou {labelPlayer(match.activePlayerId)}</button>
          </div>
        </div>
      )}

      {match.outcome && (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <span className={styles.eyebrow}>CONEXÃO ENCERRADA</span>
            <h2>{winner ? `${labelPlayer(winner)} venceu.` : "Empate."}</h2>
            <p>O SINAL chegou a zero.</p>
            <button className={styles.primaryButton} onClick={start}>Jogar novamente</button>
          </div>
        </div>
      )}
    </main>
  );
}

function HandCard({ card, selected, onClick }: { card: CardDefinition; selected: boolean; onClick: () => void }) {
  return (
    <button className={`${styles.card} ${styles[`class${card.cardClass}`]} ${selected ? styles.selectedCard : ""}`} onClick={onClick}>
      <div className={styles.cardTop}><span className={styles.cost}>{card.cost}</span><small>{card.type === "COMMAND" ? "COMANDO" : card.cardClass}</small></div>
      <strong>{card.name}</strong>
      <p>{card.rulesText || "Sem habilidade."}</p>
      {card.type === "CONTROOLZ" && <div className={styles.stats}><span>⚔ {card.attack}</span><span>◆ {card.defense}</span></div>}
    </button>
  );
}

function BoardSlot({ match, unit, lane, enemy = false, selected = false, onClick }: { match: MatchState; unit: UnitState | null; lane: LaneIndex; enemy?: boolean; selected?: boolean; onClick?: () => void }) {
  if (!unit) {
    return <button className={`${styles.slot} ${selected ? styles.slotReady : ""}`} onClick={onClick} disabled={!onClick}><small>LINHA {lane + 1}</small><span>{selected ? "+ CONECTAR" : "VAZIA"}</span></button>;
  }
  const card = unitCard(unit);
  const attack = getSet001EffectiveAttack(match, unit, COLLECTION_001);
  const defense = getSet001EffectiveDefense(match, unit, COLLECTION_001);
  return (
    <button className={`${styles.unit} ${styles[`class${card.cardClass}`]} ${enemy ? styles.enemyUnit : ""}`} onClick={onClick} disabled={!onClick}>
      <div className={styles.cardTop}><small>LINHA {lane + 1}</small><small>{card.cardClass}</small></div>
      <strong>{card.name}</strong>
      <p>{card.rulesText || "Sem habilidade."}</p>
      <div className={styles.stats}><span>⚔ {attack}</span><span>◆ {defense}</span></div>
      {!enemy && match.phase === "COMBAT" && <em>TOQUE PARA ATACAR</em>}
    </button>
  );
}
