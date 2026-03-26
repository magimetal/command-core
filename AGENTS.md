# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-21
**Commit:** n/a (workspace is not a git repo)
**Branch:** n/a (workspace is not a git repo)

## OVERVIEW
Command Core is a terminal-native tower defense MVP in Node.js + TypeScript + Ink.
Single-process game loop: input -> state update -> frame string composition -> terminal render.

## STRUCTURE
```text
terminal-tower-defense/  # Current repository directory name (product name: Command Core)
├── src/                # Runtime code (state, simulation, rendering, input)
│   ├── const/          # Canonical gameplay and map constants
│   ├── models/         # Shared type contracts
│   ├── simulation/     # Deterministic tick pipeline
│   ├── rendering/      # ANSI frame composition + HUD/log formatting
│   ├── input/          # Ink key handler to app callbacks
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
| Frame output and width behavior | `src/rendering/frame-composer.ts` | One bordered frame string; grid centered to non-grid width |
| Shared rendering tokens/utilities | `src/rendering/text-utils.ts`, `src/rendering/text-styles.ts`, `src/rendering/hp-bar.ts` | Centralized ANSI width helpers, semantic text styles, and reusable HP bar text |
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
- State phases are explicit string unions (`TITLE`, `MODE_SELECT`, `MAP_SELECT`, `PREP`, `WAVE_ACTIVE`, `WAVE_CLEAR`, `VICTORY`, `GAME_OVER`).
- Simulation functions are pure-state transforms returning full `GameState` objects.
- Event log is newest-first; in-memory cap is 7 entries (`appendEventLog`). Display cap is 2 lines in gameplay frame.
- User-facing event prefixes carry semantics: `✕` kill, `!` leak, `>>` wave, `✗` error, `~` hit-threshold.
- Rendering path strips ANSI for layout math before padding/centering.

## ANTI-PATTERNS (THIS PROJECT)
- Do not reorder tick pipeline steps; tests assert movement-before-combat behavior.
- Do not mutate `runConfig.grid` directly; `createInitialState` clones map-derived grid data.
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

## Design Context

### Users
- Primary users are **developers/hobbyists** and **strategy gamers**.
- Typical usage context includes **quick runs** and **focused sessions**, often inside **tmux/SSH terminal panes**.
- Core jobs to be done:
  - Parse battlefield state at a glance (readability first)
  - Make confident tactical decisions under wave pressure
  - Explore higher-skill strategy/mastery over repeated runs
  - Experience a polished terminal-native UX showcase

### Brand Personality
- 3-word personality: **Arcade · Retro · Energetic**.
- Voice and tone should feel like a **command console with personality**: crisp, tactical messaging with selective bursts of excitement.
- Emotional goals:
  - **Confident control** (clear information hierarchy)
  - **Tense urgency** (waves feel consequential)
  - **Playful delight** (small moments of charm without sacrificing clarity)

### Aesthetic Direction
- Visual tone: **terminal-first tactical arcade** with Unicode glyph language and bordered frame composition.
- References:
  - **Traditional roguelikes** for dense, legible symbol semantics
  - **Modern game UI/HUD patterns** for hierarchy, momentum, and feedback clarity
- Anti-reference:
  - Must **not** resemble a flat spreadsheet-like utility display.
- Theme and color direction:
  - ANSI-driven, terminal-native presentation (dark-terminal friendly by default)
  - No strict required or forbidden brand colors currently
  - Preserve symbol/text redundancy so meaning is never color-only

### Design Principles
1. **One-glance tactical readability**
   - Critical state (HP, wave, threats, cursor context, recent events) must be scannable in under a second.
2. **Energy without noise**
   - Keep retro-arcade personality and tension cues, but avoid clutter that obscures decision-making.
3. **Color is reinforcement, not dependency**
   - Pair color with glyphs, prefixes, and labels to support accessibility and terminal variability.
4. **Pane-safe composition**
   - Respect constrained terminal layouts (tmux/SSH) and maintain strict frame-budget discipline.
5. **Phase-aware ceremony**
   - Title/mode/end states should feel intentional and expressive, while active gameplay remains information-first.
