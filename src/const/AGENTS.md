# CONSTANTS KNOWLEDGE BASE

## OVERVIEW
`src/const/` defines gameplay truth: map geometry, archetype stats, wave composition, and frame cadence.

## STRUCTURE
```text
src/const/
├── game.ts              # Start HP/gold, frame interval, streak thresholds
├── operations-maps.ts   # Operations mode map definitions (3 maps, 16x34)
├── map.ts               # Legacy 16x28 grid, blocked lane, S-curve path
├── enemies.ts           # Enemy archetypes, stats, symbols, rewards, leak damage
├── towers.ts            # Tower archetypes, costs, damage/range/cooldown/symbols
├── waves.ts             # 3-wave spawn recipes, per-group intervals
├── event-prefixes.ts    # Canonical log/event prefix glyph tokens
└── glyphs.ts            # Shared HUD/menu glyph tokens
```

## WHERE TO LOOK
| Need | File | Notes |
|------|------|-------|
| Tune economy | `game.ts`, `towers.ts`, `enemies.ts` | Gold flow = kill reward - tower cost |
| Tune pacing | `waves.ts`, `game.ts`, `enemies.ts` | Spawn intervals + speed + frame interval |
| Change pathing | `map.ts`, `operations-maps.ts` | Waypoints generated, not hardcoded matrix |
| Change visuals | `towers.ts`, `enemies.ts` | Symbols consumed by renderer |
| Event prefixes | `event-prefixes.ts` | `✕` kill, `!` leak, `>>` wave, `✗` error, `~` streak |
| HUD glyphs | `glyphs.ts` | HP, wave, separators, menu arrows |

## CONVENTIONS
- Keep archetype keys aligned with enum values (`RAPID`, `CANNON`, `STANDARD`, `TANK`).
- Keep symbols single-cell friendly (terminal monospace).
- Keep map updates via builders, not ad-hoc cell edits.
- Treat exported defs as canonical read-only inputs.

## ANTI-PATTERNS
- Do not mutate `MAP_GRID` at runtime; `createInitialState` clones it.
- Do not add wave entries without validating spawn queue expectations in tests.
- Do not desync symbol changes from rendering tests that assert glyph presence.
- Do not introduce magic numbers when a const already exists.
