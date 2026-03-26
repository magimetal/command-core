# SOURCE TREE KNOWLEDGE BASE

## OVERVIEW
`src/` is the runtime slice: deterministic simulation + terminal rendering + key-driven control wiring.

## STRUCTURE
```text
src/
├── app.tsx              # Loop timer, action handlers, phase transitions
├── main.ts              # Ink render entrypoint
├── const/               # Archetypes, map/path, wave definitions, runtime constants
├── models/              # State contracts and domain types
├── simulation/          # Tick pipeline and pure state transforms
├── rendering/           # Frame builder, color mapping, HUD/event presentation
└── input/               # Keyboard adapter (`useInput` -> app callbacks)
```

## WHERE TO LOOK
| Task | Location | Why here |
|------|----------|----------|
| Launch and render App | `main.ts` | Single CLI entrypoint |
| Frame loop frequency/stop behavior | `app.tsx` + `const/game.ts` | `setInterval` + `FRAME_INTERVAL_MS` + end-phase stop |
| Core tick contract | `simulation/tick.ts` | Locked sequence + cleanup phase changes |
| Wave start and queue materialization | `simulation/start-wave.ts` | PREP gate + queue generation from `WAVES` |
| Spawn cadence and PREP/VICTORY transitions | `simulation/wave-controller.ts` | `spawnTimerTicks` + WAVE_CLEAR logic |
| Terminal layout constraints | `rendering/frame-composer.ts` | Border composition, centering, title/end screens |
| Shared rendering tokens/utilities | `rendering/text-utils.ts`, `rendering/text-styles.ts`, `rendering/hp-bar.ts` | ANSI width helpers, semantic text styles, reusable HP bar text |
| Input precedence | `input/input-handler.ts` | `Q` first, then title any-key gate, then controls |

## CONVENTIONS (SRC-SPECIFIC)
- Keep transforms pure: return new state, no in-place mutations.
- Preserve phase gates in handlers (`TITLE` blocks gameplay actions).
- Keep render output as one composed frame string.
- Keep identifiers deterministic (`enemy-${frame}-...`, `tower-${n}`).
- Keep user messages short and symbol-prefixed for log scanning.

## ANTI-PATTERNS
- Do not move orchestration logic into input layer; input is adapter-only.
- Do not split frame rendering into multi-root writes; border builder expects one block.
- Do not bypass `startWave`/`advanceWave` phase checks from app handlers.
- Do not mix test-only helpers into runtime modules.
