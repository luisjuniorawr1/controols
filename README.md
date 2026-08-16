# CONTROOLS

CONTROOLS is becoming a narrative cyber-security investigation game for families and friends.

The public prototype is **Case 001 — O Login da Meia-Noite**: five fixed characters investigate a suspicious message, a compromised account and an offline security camera. One player is human in the current local prototype and the remaining four seats are filled by bots.

## Core rules

- Every adventure has exactly five character seats.
- A session supports 1–5 human controllers; bots fill every remaining seat.
- Roles are always 1 Digital Thief, 1 Detective, 1 Spy and 2 Residents.
- Characters and secret roles are separate. Any character can receive any role in a new session.
- No human or bot receives the other players' roles.
- The Game Master owns the full state. Each player view contains only public facts plus that player's private role, objective and observations.
- Bot decisions are driven by their own personality profile, private observations, memory/suspicion model and public evidence — never by the complete role map.

## Prototype flow

1. Choose one of the five characters.
2. Receive a private random role.
3. Investigate a suspicious condominium message.
4. Inspect the link and choose relevant signals.
5. Hear bot arguments generated from their profiles and private state.
6. Reconstruct the incident timeline.
7. Investigate two apps on a compromised device.
8. Vote for the suspected manipulator.
9. Reveal the roles and ending, then replay with new assignments.

## Architecture

The first implementation lives in:

- `src/game/types.ts` — isolated game and private-state types
- `src/game/characters.ts` — five fixed character profiles and role objectives
- `src/game/engine.ts` — role assignment, player views and bot decisions
- `src/game/firstStory.ts` — Case 001 story data
- `src/components/StoryPrototype.tsx` — playable narrative prototype
- `app/story-game.css` — investigation-game visual system

The current prototype runs entirely in the browser. Secure TV + phone rooms will require moving the Game Master/private state to a server so each device only receives its authorized player view.

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

The deploy workflow runs build + three smoke tests and publishes to Firebase Hosting. The retired 649-tool full QA is no longer part of deployment.
