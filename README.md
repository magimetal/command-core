# Terminal Tower Defense

Terminal-native tower defense built with **Node.js + TypeScript + Ink**.

This project runs directly in your terminal (including tmux panes) and now reflects a beta-style pass over the MVP loop: place/sell towers, start waves, defend the base, and finish with either **VICTORY** or **GAME OVER** plus final **Score**.

## Current State

- ✅ Playable terminal-first beta pass complete
- ✅ Redesign + map overhaul integrated (wider grid, denser route, stronger readability)
- ✅ Expanded simulation/rendering/input coverage for new mechanics
- ✅ Framed dashboard presentation (title, playfield, HUD, controls, event log, ceremony end states)

## What’s Built

### Core Gameplay

- Single handcrafted **16x28** map with a denser multi-turn route
- **5-wave** progression with manual wave start (`Space`)
- Economy loop:
  - Earn gold from kills
  - Spend gold on tower placement
  - Sell towers during placement phases (`S`) for partial refund
- Four tower archetypes:
  - **RAPID** (`⟁`) — low damage, fast cooldown
  - **CANNON** (`⊛`) — high damage, slower cadence
  - **SNIPER** (`⟇`) — long-range precision burst
  - **SLOW** (`⊗`) — applies real movement slow debuff on hit
- Three enemy archetypes:
  - **STANDARD** (`◀`) — baseline HP/speed/reward
  - **TANK** (`⬟`) — high HP, slower cadence, heavier leak damage
  - **FAST** (`▷`) — low HP, highest movement tempo
- Win/Lose outcomes:
  - **VICTORY** after all waves clear
  - **GAME OVER** when base HP reaches zero

### Presentation / UX

- Full bordered frame layout in terminal
- Title screen with launch prompt (`Any key`)
- Colored grid entities (path, buildable, towers, enemies, cursor, projectile pass)
- Centered grid region for readability
- Two-line HUD with wave preview, selected towers, cursor detail, and per-tower/enemy context
- Structured controls and event-log sections
- Placement helpers:
  - ghost tower cursor on valid build cells in placement phases
  - visible placement range ring (`◌`) for selected archetype
- Visible cosmetic projectiles per archetype
- Event log (7 lines, newest-first) with typed feedback:
  - wave start/clear
  - tower placement success/failure
  - kills, leaks, sells, and thresholded enemy HP hit updates
- Ceremony-style VICTORY/GAME OVER screens with run summary and score

## Install

```bash
npm install
```

## Run

```bash
npm start
```

## Build

```bash
npm run build
```

## Test

```bash
npm test
```

## Controls

- `Any key` — advance from TITLE to PREP
- `1` — select RAPID tower
- `2` — select CANNON tower
- `3` — select SNIPER tower
- `4` — select SLOW tower
- `↑ ↓ ← →` — move placement cursor
- `Enter` — place selected tower at cursor
- `S` — sell tower at cursor (PREP/WAVE_CLEAR only)
- `Space` — start wave (PREP only)
- `Q` — quit immediately

## Gameplay Loop

1. Launch to **TITLE** screen
2. Enter **PREP** phase and position towers
3. Press `Space` to start wave (**WAVE_ACTIVE**)
4. Survive until enemies and spawn queue are empty (**WAVE_CLEAR**)
5. Auto-transition to next **PREP** wave, or to **VICTORY** if final wave is complete
6. Lose at any time if base HP hits 0 (**GAME_OVER**)

## High-Level Architecture

```text
src/
  const/        game constants (map, towers, enemies, waves, timings)
  models/       state/data types
  simulation/   deterministic tick logic (wave -> move -> combat -> cleanup)
  rendering/    frame composition, colors, HUD, event-log presentation
  input/        key handling via Ink useInput
  app.tsx       root app state + game loop wiring
  main.ts       CLI entrypoint

tests/
  simulation/   combat, movement, wave control, economy, placement/sell, tick flow, score, end-state
  rendering/    frame composition, path/range/projectile behavior, terminal-size guardrails
  input/        control handling (title gate, 1-4 selection, sell key)
```

### Tick Contract

Simulation advances in fixed order:

1. `advanceWave`
2. `advanceEnemies`
3. `resolveCombat`
4. `cleanup`

That order is intentional and documented as part of the MVP design contract.

## Terminal Notes

- Designed for terminal-first play and tmux-friendly dimensions
- Uses Unicode symbols and ANSI color for readability
- No browser renderer, no mouse requirements, no GUI wrapper

## Project Docs

- `SPEC.md` — original product/MVP spec
- `MVP.md` — process history and decision record
- `CHANGELOG.md` — milestone history and seeded releases
