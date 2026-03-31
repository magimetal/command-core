# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-31
**Commit:** 6d86e3f
**Branch:** main

## OVERVIEW
Command Core is a terminal-native tower defense MVP in Node.js + TypeScript + Ink.
Single-process game loop: input -> state update -> frame string composition -> terminal render.

## STRUCTURE
```text
terminal-tower-defense/
├── src/                # Runtime code (state, simulation, rendering, input)
│   ├── const/          # Archetypes, map/path, wave definitions, runtime constants
│   ├── models/         # Shared type contracts
│   ├── simulation/     # Deterministic tick pipeline
│   ├── rendering/      # ANSI frame composition + HUD/log formatting
│   ├── input/          # Ink key handler to app callbacks
│   ├── components/     # React UI screens and HUD panels
│   ├── utils/          # Event log, PRNG, threat radar helpers
│   ├── app.tsx         # Main loop, phase transitions, action wiring
│   └── main.ts         # CLI entrypoint
├── tests/              # Guardrails for simulation, rendering, input
├── README.md           # Quickstart and project overview
├── AGENTS.md           # Project knowledge base for agents
└── CHANGELOG.md        # Release history
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Boot sequence | `src/main.ts`, `src/app.tsx` | `main.ts` renders `App`; loop timer in `App` |
| Tick ordering contract | `src/simulation/tick.ts` | Order is locked: wave -> movement -> combat -> cleanup |
| Wave spawning and victory transition | `src/simulation/wave-controller.ts`, `src/simulation/start-wave.ts` | `WAVE_CLEAR` advances wave or enters `VICTORY` |
| Tower placement errors/messages | `src/simulation/tower-placement.ts`, `src/app.tsx` | Error strings converted to user-facing `✗` messages |
| Grid/map geometry | `src/const/operations-maps.ts` | 16x34 grids; map geometry and paths are defined per operations map |
| Terminal layout constraints | `src/components/GameplayFrame.tsx` | Section composition, centering, pane-fit guidance |
| Shared rendering tokens/utilities | `src/rendering/text-utils.ts`, `src/rendering/text-styles.ts`, `src/rendering/hp-bar.ts` | ANSI width helpers, semantic text styles, HP bar text |
| Input gates | `src/input/input-handler.ts` | `Q` preempts title any-key gate |
| Rendering guardrails | `tests/rendering/` | Width <= 78, height <= 33 assertions |

## CODE MAP
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `App` | React component | `src/app.tsx` | Loop timer, action dispatch, frame composition |
| `tick` | state reducer | `src/simulation/tick.ts` | Canonical step order + terminal phase transitions |
| `advanceWave` | wave scheduler | `src/simulation/wave-controller.ts` | Spawns enemies, handles wave boundaries |
| `resolveCombat` | combat resolver | `src/simulation/combat.ts` | Targeting, damage, cooldown reset |
| `composeGameplayFrame` | renderer | `src/components/GameplayFrame.tsx` | Gameplay HUD composition |
| `InputHandler` | React hook | `src/input/input-handler.ts` | `useInput` -> app callback adapter |

## CONVENTIONS
- State phases: explicit string unions (`TITLE`, `MODE_SELECT`, `MAP_SELECT`, `PREP`, `WAVE_ACTIVE`, `WAVE_CLEAR`, `VICTORY`, `GAME_OVER`).
- Simulation functions are pure-state transforms returning full `GameState` objects.
- Event log newest-first; in-memory cap 7 entries, display cap 2 lines.
- Event prefixes carry semantics: `✕` kill, `!` leak, `>>` wave, `✗` error, `~` hit-threshold.
- Rendering strips ANSI for layout math before padding/centering.
- Unicode glyph language: `△ ◉ ▸ ◈ ⟶ ⬡` as gameplay affordances.

## ANTI-PATTERNS (THIS PROJECT)
- Do not reorder tick pipeline steps; tests assert movement-before-combat behavior.
- Do not mutate `runConfig.grid` directly; `createInitialState` clones map-derived grid data.
- Do not bypass phase gates (title intercept, PREP-only wave start).
- Do not grow event-log capacity without updating frame and tests.
- Do not add browser/UI abstractions; product scope is terminal-native Ink.

## UNIQUE STYLES
- End states are ceremony screens, not HUD overlays.
- Grid is centered relative to wider non-grid sections for tmux readability.
- Frame budget discipline: width <= 78, height <= 33.

## COMMANDS
```bash
npm install
npm start
npm run build
npm test
```

## NOTES
- Runtime configured as CommonJS in `package.json`.
- `FRAME_INTERVAL_MS=67` (~15 FPS target); loop stops on `GAME_OVER`/`VICTORY`.
- Anomaly mode uses procedurally generated maps via seed-based PRNG.

## Design Context

### Users
- Primary users are **developers/hobbyists** and **strategy gamers**.
- Typical usage context: **quick runs**, **focused sessions**, often inside **tmux/SSH terminal panes**.
- Core jobs: parse battlefield state at a glance, make confident tactical decisions, explore higher-skill strategy.

### Brand Personality
- 3-word personality: **Arcade · Retro · Energetic**.
- Voice and tone: **command console with personality**: crisp, tactical messaging with selective bursts of excitement.
- Emotional goals: confident control, tense urgency, playful delight.

### Aesthetic Direction
- Visual tone: **terminal-first tactical arcade** with Unicode glyph language.
- References: traditional roguelikes for dense symbol semantics, modern game UI/HUD patterns for hierarchy.
- Anti-reference: must **not** resemble flat spreadsheet-like utility display.
- Theme: ANSI-driven, dark-terminal friendly, no color-only dependencies.

### Design Principles
1. **One-glance tactical readability** - Critical state scannable in under a second.
2. **Energy without noise** - Retro-arcade personality without obscuring decisions.
3. **Color is reinforcement, not dependency** - Pair color with glyphs/labels.
4. **Pane-safe composition** - Respect constrained terminal layouts.
5. **Phase-aware ceremony** - Title/mode/end states intentional and expressive.
