# SIMULATION KNOWLEDGE BASE

## OVERVIEW
`src/simulation/` is the deterministic game engine: pure state transforms, locked tick order, and phase transitions.

## STRUCTURE
```text
src/simulation/
├── tick.ts              # Master tick: locked wave->movement->combat->cleanup order
├── wave-controller.ts   # Spawn cadence, WAVE_CLEAR/VICTORY transitions
├── start-wave.ts        # PREP gate, queue generation, WAVE_ACTIVE transition
├── combat.ts            # Targeting, damage, cooldown reset, projectiles
├── enemy-movement.ts    # Path following, speed application, leak detection
├── tower-placement.ts   # Build validation, cost deduction, grid mutation
├── tower-sell.ts        # Refund logic, grid cleanup
├── menu-flow.ts         # Menu navigation state machines
├── create-initial-state.ts  # State factory from map/run config
├── anomaly-gen.ts       # Procedural map generation (anomaly mode)
├── anomaly-path.ts      # Pathfinding for generated maps
├── score.ts             # Kill tracking, streak milestones
└── grid-cell.ts         # Cell mutation utilities
```

## WHERE TO LOOK
| Need | File | Why |
|------|------|-----|
| Tick order contract | `tick.ts` | Wave → movement → combat → cleanup; tests enforce this |
| Spawn timing logic | `wave-controller.ts` | `spawnTimerTicks`, queue draining, phase transitions |
| Wave start trigger | `start-wave.ts` | PREP-only gate, queue materialization |
| Tower damage/AI | `combat.ts` | Target selection, projectile spawning, cooldowns |
| Enemy pathing | `enemy-movement.ts` | Waypoint following, end-of-path leak damage |
| Build validation | `tower-placement.ts` | Obstacle/buildable/occupied/currency checks |
| Sell refunds | `tower-sell.ts` | `SELL_REFUND_PERCENTAGE` application |
| Anomaly maps | `anomaly-gen.ts`, `anomaly-path.ts` | PRNG-based generation with guaranteed paths |
| Menu state | `menu-flow.ts` | Cursor navigation, confirm/back handlers |

## CONVENTIONS
- Pure functions only: input state -> output state, no mutations.
- Phase transitions only via `tick.ts` cleanup or explicit menu-flow handlers.
- Enemy IDs deterministic: `enemy-${frame}-${index}`.
- Tower IDs sequential: `tower-${n}`.

## ANTI-PATTERNS
- Do not add side effects in simulation (no console, no external calls).
- Do not bypass `tick.ts` order; movement-before-combat is load-bearing.
- Do not mutate grid cells directly outside `tower-placement.ts`/`tower-sell.ts`.
- Do not leak anomaly-generation details into normal mode logic.
