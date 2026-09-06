# CONTROOLS / CONTROOLZ

> **Branch `tcg-foundation`:** esta branch contém a fundação técnica da nova fase **CONTROOLZ**, um TCG digital presencial 1x1. A `main` ainda representa o produto infantil anterior e não deve ser substituída até o novo loop de duelo estar validado.

## Nova fase — CONTROOLZ TCG

A arquitetura nova está isolada em `src/tcg/` e `docs/tcg/`.

### Estado atual da fundação

- Coleção 001 importada com 200 cartas;
- classes RAGE, LOGIC, WILD, GLITCH, VOID, PRIME e NEUTRAL;
- tipos CONTROOLZ e COMMAND (COMANDO na interface);
- 20 de SINAL por Controller;
- campo de 3 linhas;
- energia crescente por **turno próprio** de cada Controller, até 7;
- CONEXÃO e DESCONEXÃO modeladas como triggers;
- primeiro motor determinístico para conectar Controolz, executar Comandos, atacar, causar dano, destruir unidades e reduzir SINAL;
- combate simultâneo remove todos os Controolz já letalmente atingidos antes de resolver DESCONEXÕES daquele evento;
- primeira leva de efeitos estruturados do Set 001;
- auditoria de cobertura para impedir que texto livre seja executado por adivinhação;
- testes dedicados em `tests/tcg-engine.spec.ts`;
- CI isolado de PR em `.github/workflows/tcg-pr.yml`.

### Arquivos principais

- `docs/tcg/GAME_RULES.md` — regras-base do duelo;
- `docs/tcg/ARCHITECTURE.md` — arquitetura de produto, economia e backend;
- `src/tcg/domain.ts` — modelo de domínio;
- `src/tcg/rules.ts` — configuração central das regras;
- `src/tcg/cards/collection001.ts` — catálogo runtime da Coleção 001;
- `src/tcg/cards/set001/` — importação por classe e normalização runtime;
- `src/tcg/cards/runtime-audit.ts` — auditoria do que já pode ser executado pelo engine;
- `src/tcg/engine/match.ts` — estado/turnos/SINAL;
- `src/tcg/engine/duel.ts` — ações do duelo;
- `src/tcg/backend-contracts.ts` — pacotes, moeda, presença, antifraude e trocas.

### Desenvolvimento da nova fase

```bash
npm install
npm run lint
npm run qa:tcg
```

O motor ainda está em construção. Nem toda habilidade das 200 cartas possui ação estruturada; quando uma carta ainda depende apenas de texto, o runtime a reporta como pendente em vez de interpretar seu texto automaticamente.

---

## Produto anterior preservado nesta branch

O restante deste repositório continua contendo o protótipo visual infantil original para que nada seja perdido durante a transição.

CONTROOLS is a visual adventure-game universe for children ages 7–10. The product is designed to turn different subjects into playful stories, challenges and discoveries with a recurring cast of characters.

**Digital safety is the first collection, not the limit of the product.** Future CONTROOLS collections may explore technology, science, citizenship, the environment, finance, culture and other themes while preserving the same core cast and interaction model.

The game is **single-player by design**. One child plays each session and works together with Luna, Theo, Maya, Caio and Nina to solve the current adventure. There is no second-player mode, no social-deduction role system and no need to identify a culprit among players.

## Core product rules

- Every adventure is made for exactly one child playing at a time.
- Luna, Theo, Maya, Caio and Nina are the recurring official cast across the entire CONTROOLS universe.
- Character continuity is non-negotiable: face, hair, clothes, signature colors and accessories must remain recognizable from scene to scene and from collection to collection. New poses, expressions, lighting and environments are allowed; redesigning the character identity inside an adventure is not.
- New collections can explore different subjects without changing the CONTROOLS brand or replacing the recurring cast.
- Gameplay is **image-first and text-light**. Illustrations should explain the moment before the child needs to read.
- Child-facing text must use **large, thick, rounded/bold lettering**, short phrases and strong contrast. Prefer one giant headline, one short support line and one obvious action per scene; avoid paragraph-heavy screens.
- Approved character art and the official character lineup are the visual source of truth for all new scene generation.
- **No CONTROOLS game screen may use page scrolling. Every game state must fit completely inside one physical viewport.** If a scene does not fit, redesign its layout, density, typography or controls instead of adding a scrollbar.
- Stories teach through adventure, observation, decisions and problem solving rather than classroom-style lessons.
- Approved game art is stored and served from the repository at its original resolution. Do not downscale or convert master artwork to a lossy replacement for deployment.
- Scene art should reserve a calm UI-safe zone when interactive controls overlay the illustration. **O Cofre das Senhas is the composition benchmark:** character/action primarily left or center, with a clear right-side interaction area.
- Future TV/QR pairing should preserve the solo model: one child/session/controller, with the TV acting as the adventure screen rather than introducing multiplayer.

## Product surfaces

- `controols.com` is the public product homepage. It introduces the CONTROOLS universe, recurring characters, available collections and app access.
- The Android app will become the primary player entry point when the APK is ready for distribution.
- A future invitation flow will support short access codes and QR Codes. Access control must be validated by a backend/session mechanism; hiding a static game URL is not considered secure gating.
- Browser game routes currently remain available during prototype development and QA.

## Current story benchmark

The active playable reference is **O Cofre das Senhas**. It is the gold standard for the next CONTROOLS stories because it combines the strongest narrative rhythm, character rotation, interaction density and visual composition in the current prototype.

The retired prototypes **A Mensagem Misteriosa** and **O Link Fantasma** have been removed from the active product and their production scene masters are no longer part of the game build.

Every new adventure should start from the rules in [`docs/STORY_STANDARD.md`](docs/STORY_STANDARD.md), rather than copying an older case or improvising a new interaction model.

## Current implementation

The active children's prototype lives in:

- `src/game/kidsStory.ts` — official characters, reference-story metadata and challenge data
- `src/components/KidsStoryPrototype.tsx` — playable gold-standard story flow
- `docs/STORY_STANDARD.md` — narrative, visual and interaction blueprint for future stories
- `app/page.tsx` — public CONTROOLS product homepage
- `app/marketing-home.css` — public homepage visual system
- `app/kids-game.css` / `app/kids-game-v3.css` — children's game visual system
- `app/tv-viewport.css` — non-negotiable single-screen/no-scroll game viewport contract
- `app/kids-readable.css` — child-first bold typography and image-led presentation contract
- `public/game/assets/reference/character-lineup.png` — official recurring-cast visual reference
- `public/game/assets/characters/` — official individual character masters
- `public/game/assets/case-002/` — gold-standard story masters in original resolution
- `tests/qa-smoke.spec.ts` — gold-standard flow, original-resolution and viewport-fit QA

The playable prototype currently runs in the browser. Public marketing pages may scroll normally; game states may not.

## Development

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run build
npm run qa:smoke
```

The deploy workflow runs the static build, smoke QA and publishes to Firebase Hosting. Game QA uses a TV-like viewport, fails if the game page or interactive controls escape the physical screen, and verifies that the reference story keeps its original-resolution art and complete seven-beat flow.
