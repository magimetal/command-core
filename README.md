# Command Core

Terminal-native tower defense built with **Node.js + TypeScript + Ink**.

It runs directly in a terminal/tmux pane and renders each frame as one bordered text block (title/game/end screens included).

## Current Implementation Snapshot

- Single map: **16 rows × 28 columns**
- Progression: **5 waves** (`src/const/waves.ts`)
- Start state: **20 HP**, **$150**
- Loop cadence: **67ms/tick** (~15 FPS target)
- Phases: `TITLE → PREP → WAVE_ACTIVE → WAVE_CLEAR → (PREP|VICTORY)` and `GAME_OVER`
- Deterministic tick pipeline: **wave → enemy movement → combat → cleanup**

## Install / Run / Build / Test

```bash
npm install
npm start
npm run build
npm test
```

## Controls

- `Any key` — advance from `TITLE` to `PREP`
- `1` — select RAPID tower
- `2` — select CANNON tower
- `3` — select SNIPER tower
- `4` — select SLOW tower
- `↑ ↓ ← →` — move cursor
- `Enter` — place selected tower
- `S` — sell tower at cursor (`PREP` / `WAVE_CLEAR` only)
- `Space` — start wave (`PREP` only)
- `Q` — quit immediately (takes precedence, including on title)

## Core Gameplay

### Economy + Outcomes

- Gain currency from enemy kills.
- Spend currency on tower placement.
- Sell refund is `floor(cost / 2)`.
- **VICTORY** after clearing all waves.
- **GAME OVER** when base HP reaches 0.

### Towers

| Archetype | Symbol | Projectile | Damage | Range | Cooldown (ticks) | Cost | Special |
|---|---|---|---:|---:|---:|---:|---|
| RAPID | `⟁` | `·` | 1 | 3 | 2 | 50 | Fast fire |
| CANNON | `⊛` | `●` | 5 | 6 | 10 | 100 | Heavy hit |
| SNIPER | `⟇` | `◦` | 8 | 8 | 15 | 150 | Long range burst |
| SLOW | `⊗` | `~` | 2 | 4 | 6 | 75 | Applies slow (`slowDurationTicks=3`) |

### Enemies

| Archetype | Symbol | HP | Move cooldown* | Reward | Leak damage |
|---|---|---:|---:|---:|---:|
| STANDARD | `◀` | 10 | 2 | 10 | 1 |
| TANK | `⬟` | 40 | 4 | 25 | 3 |
| FAST | `▷` | 5 | 1 | 15 | 2 |

\*Lower move cooldown means faster movement cadence.

### Waves

1. Wave 1: `5× STANDARD`
2. Wave 2: `8× STANDARD`, `3× FAST`
3. Wave 3: `6× STANDARD`, `2× TANK`, `5× FAST`
4. Wave 4: `10× STANDARD`, `4× TANK`, `6× FAST`
5. Wave 5: `8× STANDARD`, `6× TANK`, `10× FAST`

## Rendering + UX Details

- Full bordered frame with section dividers.
- Grid centered against wider HUD/log lines for tmux readability.
- Title screen and ceremony end screens for `VICTORY` / `GAME_OVER`.
- Two-line HUD includes HP/gold/wave/phase plus tower picker and cursor context.
- Placement aids:
  - ghost tower preview on valid buildable cursor cells in placement phases
  - range ring preview (`◌`) for selected tower in placement phases
- Cosmetic per-shot projectile glyphs.
- Event log is **7 entries**, newest-first, with typed prefixes (`>>`, `✗`, `✕`, `!`, `~`, etc.).
- End-state frame includes final score.

### Score Formula

`max(0, enemiesKilled*12 + wavesCompleted*100 + currency - (startingHp - baseHp)*25)`

(`wavesCompleted` is all waves on victory, otherwise `wave - 1`.)

## Architecture

```text
src/
  const/        canonical gameplay constants (map/towers/enemies/waves/timing)
  models/       state and domain types
  simulation/   pure deterministic game-state transforms
  rendering/    frame/HUD/event-log composition and colorization
  input/        Ink key adapter
  app.tsx       loop timer + action wiring + phase transitions
  main.ts       CLI entrypoint

tests/
  simulation/   movement, combat, economy, placement/sell, waves, end-states, score
  rendering/    frame layout, range/projectile/path behavior, terminal guardrails
  input/        control routing and title-gate behavior
```

### Tick Contract (locked)

1. `advanceWave`
2. `advanceEnemies`
3. `resolveCombat`
4. `cleanup`

The tests enforce this ordering.

## Terminal Constraints

- Terminal-first (no browser renderer, no mouse).
- Uses Unicode + ANSI for gameplay readability.
- Rendering tests guard frame budget (max width/height constraints) for tmux-safe usage.

## Project Docs

- `SPEC.md` — product and MVP contract
- `MVP.md` — implementation process/decision history
- `CHANGELOG.md` — milestone and unreleased change history
