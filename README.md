# Terminal Tower Defense

Terminal-native tower defense built with **Node.js + TypeScript + Ink**.

This project runs directly in your terminal (including tmux panes) and delivers a full MVP loop: place towers, start waves, defend the base, and reach either **VICTORY** or **GAME OVER**.

## Current State

- ✅ Playable MVP complete
- ✅ Two major visual/UX iteration passes completed
- ✅ Test suite covering simulation, input, and rendering guardrails
- ✅ Terminal dashboard presentation (title screen, framed playfield, HUD, controls, event log, end-state ceremony screens)

## What’s Built

### Core Gameplay

- Single handcrafted map with a non-linear S-curve enemy path
- 3-wave progression with manual wave start (`Space`)
- Economy loop:
  - Earn gold from kills
  - Spend gold on tower placement
- Two tower archetypes:
  - **RAPID** (`△`) — low damage, faster firing
  - **CANNON** (`◉`) — high damage, slower firing
- Two enemy archetypes:
  - **STANDARD** (`▸`) — lower HP, faster movement cadence
  - **TANK** (`◈`) — higher HP, slower movement cadence, stronger leak damage
- Win/Lose outcomes:
  - **VICTORY** after all waves clear
  - **GAME OVER** when base HP reaches zero

### Presentation / UX

- Full bordered frame layout in terminal
- Title screen with launch prompt (`Any key`)
- Colored grid entities (path, buildable, blocked, towers, enemies, cursor)
- Centered grid region for readability
- Two-line HUD with live stats + selected tower + cursor coordinates
- Structured controls and event-log sections
- Event log with typed feedback:
  - wave start/clear
  - tower placement success/failure
  - kills, leaks, and thresholded enemy HP hit updates
- Ceremony-style VICTORY/GAME OVER screens with run summary

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
- `↑ ↓ ← →` — move placement cursor
- `Enter` — place selected tower at cursor
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
  simulation/   combat, movement, wave control, economy, placement, end-state
  rendering/    frame composition and terminal-size guardrails
  input/        control handling
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
