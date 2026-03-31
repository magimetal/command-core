# MODELS KNOWLEDGE BASE

## OVERVIEW
`src/models/` contains the shared type contracts: state shapes, entity definitions, and domain types.

## STRUCTURE
```text
src/models/
├── game-state.ts        # Core GameState type, GamePhase union
├── enemy.ts             # Enemy type, status, archetype binding
├── tower.ts             # Tower type, cooldown, archetype binding
├── cell.ts              # Grid cell types (buildable, obstacle, path)
├── projectile.ts        # Projectile type, TTL tracking
├── run-config.ts        # RunConfig: waves, grid, available towers
├── operation-error.ts   # Tower placement error types
├── tower-id.ts          # Tower ID type helpers
└── index.ts             # Barrel exports
```

## WHERE TO LOOK
| Need | File | Why |
|------|------|-----|
| State shape | `game-state.ts` | `GameState` interface, `GamePhase` union |
| Enemy definition | `enemy.ts` | Position, HP, status effects |
| Tower definition | `tower.ts` | Position, cooldown, archetype |
| Grid cells | `cell.ts` | `GridCell` union type |
| Projectiles | `projectile.ts` | Position, target, TTL |
| Run configuration | `run-config.ts` | Wave definitions, tower availability |
| Placement errors | `operation-error.ts` | `PlacementResult` type |

## CONVENTIONS
- Types are read-only contracts; mutations happen in simulation.
- Prefer explicit unions over booleans for state variants.
- Export from `index.ts` for clean imports.

## ANTI-PATTERNS
- Do not add methods to types; keep them data-only.
- Do not import simulation logic into models (circular deps).
