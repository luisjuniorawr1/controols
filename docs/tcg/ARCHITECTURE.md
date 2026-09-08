# CONTROOLZ TCG — Arquitetura inicial

Este documento descreve a separação entre regras, coleção, economia, presença e interface para que o projeto possa evoluir sem misturar lógica crítica com componentes visuais.

## Objetivos

- manter regras do duelo determinísticas e testáveis;
- permitir importar/editar centenas de cartas sem alterar o engine;
- impedir que o cliente determine resultados competitivos ou econômicos;
- suportar coleção permanente e cartas com identidade própria;
- suportar ranking mundial por porcentagem de vitórias;
- preparar o produto para duelos e trocas presenciais;
- permitir playtests rápidos mudando valores de configuração.

## Estrutura proposta

```text
src/tcg/
  domain.ts               tipos centrais
  rules.ts                parâmetros globais e utilitários
  cards/
    README.md              contrato de importação das cartas
    collection001.ts       catálogo da primeira coleção
  engine/
    match.ts               criação e evolução do estado do duelo

server / backend futuro
  inventory                propriedade individual de cartas
  packs                    sorteio e abertura de pacotes
  rewards                  anúncios e metas de partidas
  matchmaking-presence     pareamento por proximidade/QR
  ranked                   resultado e ranking global
  trades                   transferência presencial
  anti-fraud               validação de partidas e recompensas
```

## Camadas

### 1. Catálogo de cartas

Define o que uma carta *é* no jogo: nome, classe, custo, atributos e regras.

Uma definição de carta não representa uma cópia possuída por um jogador.

Exemplo conceitual:

```text
CardDefinition: Rex-09
```

### 2. Instância colecionável

Cada cópia obtida por um jogador deve receber identidade própria no backend.

Exemplo:

```text
CardInstance
  instanceId: c_01J...
  definitionId: set001-0042
  ownerId: player_123
  obtainedAt: ...
  source: rewarded_pack
```

Isso permite no futuro registrar histórico, edição, foil, ex-donos, presença em torneios e valor colecionável sem alterar o balanceamento da definição original.

### 3. Deck

Deck referencia `definitionId`/instâncias permitidas pelo formato.

A validação de deck deve acontecer no servidor antes de uma partida ranqueada.

Regras como tamanho, limite de cópias e afinidade ficam em configuração versionada porque ainda serão ajustadas por playtest.

### 4. Match engine

O engine recebe:

- configuração de regras;
- decks já validados;
- seed/ordem de compra definida pelo servidor;
- ações dos dois jogadores.

E produz:

- novo estado;
- eventos da partida;
- eventual resultado.

O engine deve ser uma máquina de estado pura sempre que possível. Isso facilita testes, replay, auditoria de fraude e reprodução de bugs.

### 5. Event log

Toda ação relevante deve gerar evento estruturado, por exemplo:

```text
TURN_STARTED
CARD_DRAWN
CARD_PLAYED
CONTROOLZ_CONNECTED
DAMAGE_DEALT
CONTROOLZ_DISCONNECTED
SIGNAL_CHANGED
TURN_ENDED
MATCH_FINISHED
```

O log deve permitir reconstruir por que uma partida terminou do jeito que terminou.

### 6. Economia

Abertura de pacote nunca deve ser sorteada apenas no navegador.

Fluxo correto:

```text
cliente solicita abertura
-> servidor verifica direito ao pacote
-> servidor sorteia usando tabela de drop versionada
-> servidor cria CardInstances
-> servidor grava resultado
-> cliente recebe a revelação
```

O mesmo princípio vale para fragmentação, moedas e transferências.

### 7. Ranking

O ranking público usa porcentagem de vitórias:

```text
wins / rankedCompletedMatches
```

O backend deve manter pelo menos:

- wins;
- losses;
- draws, se o formato passar a permiti-los;
- rankedCompletedMatches;
- distinctRankedOpponents;
- internalWinRate;
- rankingEligibility;
- seasonId.

A interface pode mostrar duas casas decimais, mas a ordenação deve usar precisão interna.

### 8. Presença

O duelo presencial deve usar uma sessão de desafio curta e verificável.

Primeira arquitetura sugerida:

1. jogador A cria desafio;
2. backend gera token/QR efêmero;
3. jogador B escaneia presencialmente;
4. ambos confirmam o vínculo;
5. backend cria a partida;
6. tokens de presença expiram e não podem ser reutilizados.

Para operações de alto valor, como trocas raras, uma confirmação presencial adicional pode ser exigida.

### 9. Antifraude

Não bloquear diversão casual por excesso de zelo. Separar:

- `casual completed`;
- `ranked valid`;
- `reward eligible`.

Uma mesma partida pode terminar normalmente para os jogadores e ainda assim ser inelegível para ranking/recompensa após validação.

## Versionamento de regras

Cada partida deve gravar a versão de regras e da coleção utilizada.

Exemplo:

```text
rulesVersion: "0.1.0"
cardPoolVersion: "set001@2026-09-06"
```

Isso evita que uma mudança de balanceamento torne replays históricos impossíveis de interpretar.

## Próximas etapas

1. importar a primeira coleção de cartas no contrato definido em `src/tcg/cards/README.md`;
2. implementar e testar o ciclo mínimo de partida;
3. construir uma tela mobile simples de playtest;
4. implementar pareamento presencial por QR;
5. persistir partidas no backend;
6. implementar coleção e decks;
7. implementar pacotes e moeda;
8. implementar ranking global;
9. só então conectar anúncios recompensados ao fluxo econômico real.
