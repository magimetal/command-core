# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-21
**Commit:** n/a (workspace is not a git repo)
**Branch:** n/a (workspace is not a git repo)

## OVERVIEW
Terminal-native tower defense MVP in Node.js + TypeScript + Ink.
Single-process game loop: input -> state update -> frame string composition -> terminal render.

## STRUCTURE
```text
terminal-tower-defense/
├── src/                # Runtime code (state, simulation, rendering, input)
│   ├── const/          # Canonical gameplay and map constants
│   ├── models/         # Shared type contracts
│   ├── simulation/     # Deterministic tick pipeline
│   ├── rendering/      # ANSI frame composition + HUD/log formatting
│   ├── input/          # Ink key handler to app callbacks
│   ├── app.tsx         # Main loop, phase transitions, action wiring
│   └── main.ts         # CLI entrypoint
├── tests/              # Guardrails for simulation, rendering, input
├── SPEC.md             # Locked product/MVP contract
├── MVP.md              # Milestone/decision history
└── CHANGELOG.md        # Release history
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Boot sequence | `src/main.ts`, `src/app.tsx` | `main.ts` renders `App`; loop timer in `App` |
| Tick ordering contract | `src/simulation/tick.ts` | Order is locked: wave -> movement -> combat -> cleanup |
| Wave spawning and victory transition | `src/simulation/wave-controller.ts`, `src/simulation/start-wave.ts` | `WAVE_CLEAR` advances wave or enters `VICTORY` |
| Tower placement errors/messages | `src/simulation/tower-placement.ts`, `src/app.tsx` | Error strings converted to user-facing `✗` messages |
| Grid/map geometry | `src/const/map.ts` | 16x22 grid; fixed S-curve path; blocked vertical lane |
| Frame output and width behavior | `src/rendering/frame-composer.ts` | One bordered frame string; grid centered to non-grid width |
| Input gates | `src/input/input-handler.ts` | `Q` preempts title any-key gate |
| Rendering guardrails | `tests/rendering/frame-composer.test.ts` | Width <= 78, height <= 33 |

## CODE MAP
LSP codemap unavailable in this run; fallback map below.

| Symbol/Module | Type | Location | Role |
|---------------|------|----------|------|
| `App` | React component | `src/app.tsx` | Owns loop timer, dispatches input actions, composes rendered frame |
| `tick` | state reducer | `src/simulation/tick.ts` | Applies canonical step order and terminal phase transitions |
| `advanceWave` | wave scheduler | `src/simulation/wave-controller.ts` | Spawns queued enemies and handles wave boundary state changes |
| `resolveCombat` | combat resolver | `src/simulation/combat.ts` | Targeting, damage, cooldown reset, threshold hit log messages |
| `composeFrame` | renderer | `src/rendering/frame-composer.ts` | Builds TITLE/PREP/WAVE/END screens into one string block |

## CONVENTIONS
- State phases are explicit string unions (`TITLE`, `PREP`, `WAVE_ACTIVE`, `WAVE_CLEAR`, `VICTORY`, `GAME_OVER`).
- Simulation functions are pure-state transforms returning full `GameState` objects.
- Event log is newest-first and hard-capped at 5 lines (`appendEventLog`).
- User-facing event prefixes carry semantics: `✕` kill, `!` leak, `>>` wave, `✗` error, `~` hit-threshold.
- Rendering path strips ANSI for layout math before padding/centering.

## ANTI-PATTERNS (THIS PROJECT)
- Do not reorder tick pipeline steps; tests assert movement-before-combat behavior.
- Do not mutate `MAP_GRID` directly; initial state clones it.
- Do not bypass phase gates (title intercept, PREP-only wave start).
- Do not grow event-log capacity without updating frame and tests.
- Do not add browser/UI abstractions; product scope is terminal-native Ink.

## UNIQUE STYLES
- Uses Unicode-heavy visual language (`△ ◉ ▸ ◈ ⟶ ⬡`) as gameplay affordances.
- End states are ceremony screens, not HUD overlays.
- Grid is centered relative to wider non-grid sections for tmux readability.

## COMMANDS
```bash
npm install
npm start
npm run build
npm test
```

## NOTES
- Runtime is configured as CommonJS in `package.json`.
- `FRAME_INTERVAL_MS=67` (~15 FPS target); loop stops on `GAME_OVER`/`VICTORY`.
- No git metadata available in this workspace; AGENTS omits commit/branch specifics.
