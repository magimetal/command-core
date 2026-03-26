# CONSTANTS KNOWLEDGE BASE

## OVERVIEW
`src/const/` defines gameplay truth: map geometry, archetype stats, wave composition, and frame cadence.

## STRUCTURE
```text
src/const/
├── game.ts      # Start HP/gold + frame interval
├── map.ts       # 16x28 grid, blocked lane, generated S-curve path
├── enemies.ts   # Enemy archetypes, stats, symbols, rewards, leak damage
├── event-prefixes.ts # Canonical log/event prefix glyph tokens
├── glyphs.ts    # Shared HUD/menu glyph tokens (HP/gold/wave/menu indicators)
├── towers.ts    # Tower archetypes, costs, damage/range/cooldown
└── waves.ts     # 3-wave spawn recipes and per-group spawn intervals
```

## WHERE TO LOOK
| Need | File | Notes |
|------|------|-------|
| Tune economy | `game.ts`, `towers.ts`, `enemies.ts` | Gold flow = kill reward - tower cost |
| Tune pacing | `waves.ts`, `game.ts`, `enemies.ts` | Spawn intervals + speed + frame interval interact |
| Change pathing/map constraints | `map.ts` | Path waypoints are generated, not hardcoded as full matrix |
| Change visuals by archetype | `towers.ts`, `enemies.ts` | Symbols consumed directly by renderer |
| Change event-log semantic prefixes | `event-prefixes.ts` | Shared prefixes (`✕`, `!`, `>>`, `✗`, `~`) used by simulation/rendering |
| Change HUD/menu glyph affordances | `glyphs.ts` | Canonical glyphs for HP, wave, separators, and menu arrow |

## CONVENTIONS (CONST-SPECIFIC)
- Keep archetype keys aligned with enum values (`RAPID`, `CANNON`, `STANDARD`, `TANK`).
- Keep symbols single-cell friendly (terminal monospace).
- Keep map updates via builders (`buildEnemyPath`, `createMapGrid`), not ad-hoc cell edits.
- Treat exported defs as canonical read-only inputs for simulation/rendering.

## ANTI-PATTERNS
- Do not mutate `MAP_GRID` at runtime; `createInitialState` clones it.
- Do not add wave entries without validating spawn queue expectations in tests.
- Do not desync symbol changes from rendering tests that assert glyph presence.
- Do not introduce magic numbers in simulation when a const already exists here.
