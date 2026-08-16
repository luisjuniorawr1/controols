# CONTROOLS

CONTROOLS is a visual digital-safety adventure game for children ages 7–10.

The game is **single-player by design**. One child chooses one of the recurring CONTROOLS characters as their avatar and works together with the story cast to solve digital-safety challenges. There is no second-player mode, no social-deduction role system and no need to identify a culprit among players.

## Core product rules

- Every adventure is made for exactly one child playing at a time.
- Luna, Theo, Maya, Caio and Nina are the recurring official cast across the game.
- The child chooses one character to represent them; the other characters remain allies inside the story.
- Gameplay is image-first and text-light, with large illustrations, short choices and visual challenges suitable for a TV-sized screen.
- Stories teach safe digital behavior through adventure and problem solving rather than classroom-style lessons.
- Approved game art is stored and served from the repository at its original resolution. Do not downscale or convert master artwork to a lossy replacement for deployment.
- Future TV/QR pairing should preserve this solo model: one child/session/controller, with the TV acting as the shared adventure screen rather than introducing multiplayer.

## Current adventure

**Case 001 — A Mensagem Misteriosa**

1. Start the adventure.
2. Choose one of the five official characters.
3. Help Luna inspect a suspicious message.
4. Find visual warning signs in the message and link.
5. Learn that a padlock/HTTPS alone does not prove a site is trustworthy.
6. Choose a safer way to verify the message.
7. Combine two clues from the CONTROOLS team.
8. Build the CONTROOLS safety shield and complete the mission.

## Current implementation

The active children's prototype lives in:

- `src/game/kidsStory.ts` — official characters, story metadata and challenge data
- `src/components/KidsStoryPrototype.tsx` — playable Case 001 flow
- `app/story-game.css` — children's game visual system
- `public/game/assets/` — original-resolution character, scene, reference and UI artwork
- `tests/qa-smoke.spec.ts` — critical single-player flow and original-resolution image checks

The prototype currently runs entirely in the browser. TV presentation and QR/controller pairing will be added only after the browser game loop is validated, while keeping the game single-player.

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

The deploy workflow runs the static build, three smoke tests and publishes to Firebase Hosting.
