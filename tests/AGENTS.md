# TESTS KNOWLEDGE BASE

## OVERVIEW
`tests/` contains the guardrails: simulation correctness, rendering constraints, and input behavior.

## STRUCTURE
```text
tests/
├── simulation/            # Core game logic tests
│   ├── tick.test.ts           # Tick order enforcement
│   ├── combat.*.test.ts       # Targeting, damage, projectiles, LOS
│   ├── enemy-movement.test.ts # Path following, leak detection
│   ├── tower-placement.test.ts # Build validation
│   ├── tower-sell.test.ts      # Refund logic
│   ├── wave-controller.test.ts # Spawn timing, transitions
│   ├── anomaly-*.test.ts       # Procedural generation
│   ├── mode-flow.test.ts      # Menu navigation
│   └── ...
├── rendering/             # Frame output tests
│   ├── hud-composer.test.ts   # Status bar formatting
│   ├── text-utils.test.ts     # ANSI width math
│   └── design-tokens.test.ts  # Color map validity
└── input/                 # Input handling tests
    └── input-handler.test.ts  # Key mapping, precedence
```

## WHERE TO LOOK
| Need | Location | Why |
|------|----------|-----|
| Tick order validation | `simulation/tick.test.ts` | Movement-before-combat enforcement |
| Combat correctness | `simulation/combat.*.test.ts` | Targeting, damage, projectile behavior |
| Wave spawning | `simulation/wave-controller.test.ts` | Spawn cadence, phase transitions |
| Anomaly generation | `simulation/anomaly-*.test.ts` | PRNG determinism, path validity |
| Frame constraints | `rendering/*.test.ts` | Width <= 78, height <= 33 |
| Input handling | `input/input-handler.test.ts` | Key mapping, `Q` precedence |

## CONVENTIONS
- Test files mirror `src/` structure.
- Use descriptive test names: `should enforce movement before combat`.
- Assert on state shapes, not implementation details.
- Golden tests for anomaly generation to catch drift.

## ANTI-PATTERNS
- Do not test implementation details; test behavior and state.
- Do not skip test cleanup; always reset mocks/state.
- Do not add tests that depend on specific frame timing.
