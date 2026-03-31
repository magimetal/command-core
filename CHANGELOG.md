# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows semantic-style milestone versioning for seeded history.

## [Unreleased]

### Added
- Anomaly mode wave system expansion:
  - Extended wave progression from 4-6 to 15-20 waves with exponential scaling (1.15-1.20x growth factor)
  - Archetype progression tiers: TANK unlocks wave 3, BRUTE wave 8, COLOSSUS wave 9
  - Per-archetype spawn intervals with wave-scaling (FAST 7→3 ticks, COLOSSUS 28→20 ticks)
  - Centralized archetype constants: `ARCHETYPE_UNLOCK_WAVES` and `BASE_DISTRIBUTION_WEIGHTS`
- Path personality system for procedural map generation:
  - Five distinct generation algorithms: CLASSIC (40%), SPIRAL (15%), BACKTRACK (15%), ZIGZAG_INTENSE (15%), MULTI_PASS (15%)
  - Weighted personality selection with validation
  - New shape validation helpers: `hasBacktrackMoves`, `hasPhaseTransitions`
  - Comprehensive test coverage in `tests/simulation/anomaly-path-personality.test.ts`

### Changed
- Refactored Anomaly generation for maintainability:
  - Extracted 18 path generation constants (scoring weights, thresholds, limits)
  - Added `isReversal()` helper to eliminate duplicate direction-check logic
  - Fixed spawn interval progress calculation to use actual wave count
  - Fixed archetype count adjustment to target most numerous (not last) archetype
- Improved type safety in path generation with explicit `1 | -1` annotations
- Hierarchical agent documentation system:
  - generated root `AGENTS.md` as project knowledge base with structure, code map, conventions, and design context
  - generated `src/AGENTS.md`, `src/const/AGENTS.md`, `src/components/AGENTS.md`, `src/models/AGENTS.md`, `src/rendering/AGENTS.md`, `src/simulation/AGENTS.md`, and `tests/AGENTS.md` for directory-specific guidance
  - all agent docs include "Where to Look" tables mapping common tasks to file locations
  - includes design context section with brand personality, aesthetic direction, and design principles
- Componentized Ink presentation layer:
  - new `src/components/*` screen/panel modules (`TitleScreen`, `ModeSelectScreen`, `MapSelectScreen`, `GameplayFrame`, `VictoryScreen`, `GameOverScreen`, and supporting HUD/event components)
  - new component-level render/snapshot coverage under `tests/components/*`
- Rendering design-token system:
  - new `src/rendering/design-tokens.ts` with centralized semantic color/styling helpers used by HUD/grid/event rendering
  - new `tests/rendering/design-tokens.test.ts` and snapshot coverage for token output stability
- Simulation grid-cell utility module (`src/simulation/grid-cell.ts`) with shared `isInBounds`, `getCellAt`, and `updateCellAt` helpers to centralize coordinate-safe cell reads/writes.
- Operations content expansion for long-form runs:
  - added eight new Operations maps (Perimeter, Zigzag, The Coil, Reverse Run, Labyrinth, The Crucible, Blitz, Ouroboros) for a total of 10 map options
  - added map obstacle stamping support (`CellType.BLOCKED`) so each map can define non-buildable obstacle pockets without mutating path/spawn/base cells
- Enemy roster expansion with new late-wave archetypes:
  - added **BRUTE** (`B`) and **COLOSSUS** (`C`) enemy definitions with higher HP/leak pressure profiles for extended-wave scaling
- Design context persistence for future sessions:
  - new `.impeccable.md` baseline for users, brand personality, aesthetic direction, and design principles
  - mirrored `## Design Context` section in `AGENTS.md` for agent-wide consistency
- Threat-radar telemetry foundations:
  - new `src/utils/threat-radar.ts` helpers for wave-drain composition, surge-state signaling, and priority-target selection
  - new dedicated HUD behavior suite in `tests/rendering/hud-composer.test.ts`
- Rendering hardening coverage:
  - new reduced-motion checks and narrow-pane guard tests in `tests/rendering/frame-composer.test.ts`
  - new grapheme/display-width test suite in `tests/rendering/color-map.test.ts`
- Shared rendering primitives and constants:
  - new `text-utils`, `text-styles`, and `hp-bar` modules for display-width safety, semantic styling, and reusable HP bars
  - new canonical glyph and event-prefix constants in `src/const/glyphs.ts` and `src/const/event-prefixes.ts`
- New end-state restart control (`R`) with input coverage for `GAME_OVER` and `VICTORY`.

### Changed
- Refactored app rendering flow to compose phase views via dedicated Ink components instead of a single prebuilt frame string in `App`.
- Updated enemy glyph handling to use a central registry with Unicode primary symbols plus ASCII fallbacks when `REDUCED_GLYPH=1`.
- Refreshed HUD semantics and copy with shared glyph constants/event prefixes, including corrected wave-clear line messaging to use semantic wave event prefixes.
- Migrated legacy `color-map` styling exports to `design-tokens` aliases to preserve compatibility while consolidating style logic in one module.
- Simplified Operations map definitions by introducing a shared map-grid factory to remove repeated `createGrid` lambda patterns across all 10 maps.
- Refactored tower placement and tower sell mutations to use shared grid-cell helpers instead of duplicating row/column traversal logic in each simulation module.
- Removed legacy `src/const/map.ts` compatibility stub that no longer provided runtime behavior.
- Operations progression now uses map-specific extended wave tables:
  - moved Gauntlet wave definitions into shared `waves.ts`
  - expanded Crossroads and Gauntlet to 15-wave progression
  - added dedicated wave definitions for all newly introduced Operations maps
- Economy balance pass: increased RAPID tower cost from 50 to 60 and reduced FAST enemy reward from 6 to 4 to reduce mid/late-game snowball.
- Updated map/path geometry for Crossroads and The Gauntlet and refreshed map-select descriptions to match new route identities.
- Placement validation now surfaces obstacle-specific placement failures (`blocked by obstacle`) in app event messaging.
- Hardened frame rendering against real-world terminal inputs:
  - frame composition now accepts terminal column limits and gracefully falls back with a guidance frame when panes are too narrow
  - title bar map identity now truncates safely to prevent overflow from long labels/seeds
  - border padding now uses display-width-aware fitting/truncation for ANSI + Unicode content
- Gameplay telemetry and event visibility refresh:
  - HUD now renders a fixed six-line layout with phase-specific telemetry, threat focus details, and contextual cursor controls
  - gameplay frame event-log visibility is now fixed to the two most recent entries
- Added reduced-motion behavior via `REDUCED_MOTION=1`:
  - disables title scanline animation
  - disables base pulse alternation
  - removes blinking end-state cursor prompt
- Fixed right-border drift when enemies were present on the same row by correcting glyph width classification for gameplay symbols.
- Refined gameplay/HUD copy and event semantics:
  - wave start/clear, placement, sell, kill, leak, and threshold-hit messages now use shared semantic prefixes and clearer enemy display names
  - sell validation messaging now clarifies phase restrictions and empty-cursor behavior
  - HUD metadata and menu/map-select copy now provide more direct onboarding cues
- Improved frame responsiveness and render stability:
  - frame composer now adapts visible event-log rows by terminal height
  - app-level frame memoization prevents unnecessary re-composition between equivalent render keys
  - grid path symbol derivation and color run generation now use caching/grouping for cleaner output and lower per-frame overhead
- Replaced enemy map glyphs with width-safe single-column symbols (`S`, `T`, `F`, `B`, `C`) to prevent PTY/pane drift and preserve deterministic frame widths.

### Documentation
- Documented accessibility hardening flag in `README.md`.
- Updated internal agent docs (`AGENTS.md`, `src/AGENTS.md`, `src/const/AGENTS.md`) to point to shared rendering utilities and new constant modules.
- Updated `README.md` enemy archetype table to match the runtime width-safe symbol set.

### Tested
- Added component-level rendering tests for gameplay and ceremony screens, including snapshots for regression detection.
- Expanded HUD/frame/rendering coverage for:
  - reduced-glyph ASCII fallback behavior (`REDUCED_GLYPH=1`)
  - event-log header semantics and hidden-event hints
  - wave-active phase badge pulse behavior and reduced-motion suppression
  - wave-clear HUD messaging semantics regression
- Refined simulation tests for maintainability:
  - extracted shared wave-to-victory helper in `tests/simulation/operations-maps.test.ts`
  - replaced repeated setup blocks in `tests/simulation/tower-sell.test.ts` with shared prep-state and placement helpers
- Added new focused test suites:
  - `tests/simulation/combat.los.test.ts` for projectile/combat line-of-sight behavior
  - `tests/rendering/text-utils.test.ts` for grapheme/display-width helpers
- Expanded simulation/rendering/input coverage for map expansion and obstacle behavior:
  - updated map definition and wave-controller tests for the 10-map Operations roster and extended wave progression
  - updated placement/economy/input/frame/hud test assertions to cover obstacle placement failures and revised balance values
- Added coverage for end-state rerun input (`R`) and sell-error mapping in app flow.
- Expanded rendering assertions for title/mode/map/end-state framing behavior under width and row constraints.
- Added focused HUD and frame coverage for threat-radar lines, fixed two-entry gameplay event log rendering, and line-width/height guardrails.
- Added PTY repro harness coverage for dense Crossroads wave-9 rendering stability and updated rendering/simulation assertions for width-safe enemy symbols.

## [2.0.0] - 2026-03-26

### Added
- Procedural **Anomaly** mode with seeded generation:
  - seeded random-walk path generation on the 16x28 grid
  - generated 3-of-4 tower pools and 4-6 generated waves per run
  - anomaly seed surfaced as `Anomaly #<seed>` in run identity
- New simulation test suites for v2 coverage:
  - anomaly structural validation across 50 fixed seeds
  - run-config routing tests for Operations/Anomaly progression and scoring multipliers
  - anomaly balance guardrails for starting economy and tower pool viability

### Changed
- HUD and frame layout redesign within existing guardrails:
  - title bar now shows mode badge + map identity + wave/phase context
  - event log now includes a styled header and updated section spacing
  - tower panel formatting tightened for dynamic 1-N tower pools
- Title screen refinements:
  - scanline animation cadence adjusted to frame-driven 3-frame rotation
  - updated startup messaging for mode selection flow
- End-state ceremony screens now include run identity (`Operations · <map>` or `Anomaly #<seed>`)
- Score model now applies `runConfig.modeMultiplier` (1.0 Operations, 1.5 Anomaly)

### Added
- Beta-pass gameplay and presentation features:
  - New tower archetypes: **SNIPER** and **SLOW** (now 4 total)
  - New enemy archetype: **FAST** (now 3 total)
  - Tower selling flow (`S`) with sell logging
  - Cursor placement helpers: ghost tower preview + visible range ring (`◌`)
  - Cosmetic projectile rendering for active shots
  - End-state scoring surfaced in ceremony screens
- Architecture hardening and module extraction:
  - Shared `OperationError` model for typed simulation failures
  - New rendering modules for border, title screen, end-state screen, and grid composition
  - Split combat coverage into focused test files for damage, targeting, and projectile behavior

### Changed
- Map/layout overhaul for the redesign pass:
  - Grid widened from 22 to 28 columns (16x28 playfield)
  - Path rebuilt into a denser multi-turn route for tactical placement variety
- Progression and pacing updates:
  - Wave plan increased from 3 to 5 waves
  - HUD/legend text updated for expanded controls and archetypes
- UX and readability improvements:
  - Event log expanded to 7 visible lines (newest-first)
  - Stronger color routing and richer terminal presentation
  - Cursor details now surface enemy HP bars and tower kill counts
- Runtime and rendering behavior refinements:
  - Event-log helpers moved into shared utilities and `lastEventMessage` state removed
  - Placement/sell phase checks centralized via `isPlacementPhase`
  - Placement failures now use explicit error codes instead of free-form strings
  - Range preview now marks path tiles inside tower range with `•`
  - Title-to-prep transition now reads phase via ref to avoid stale phase checks

### Tested
- Expanded automated coverage for redesign and beta-pass mechanics:
  - rendering checks for path topology, range ring behavior, ghost cursor, projectile glyphs, and frame guardrails
  - simulation checks for FAST movement cadence, SLOW debuff behavior, sell flow/economy safety, and score calculation
  - input checks for expanded controls (`1-4`, `S`, title gating, quit precedence)
  - dedicated combat test suites for damage resolution, targeting rules, and projectile lifecycle

## [0.3.0] - 2026-03-21

### Added
- Iteration 2 polish pass focused on gameplay feedback clarity:
  - kill/leak/wave transition event messaging
  - expanded event-log depth and display behavior
  - cursor position in HUD and higher-contrast cursor visibility
  - section labels/separation for controls vs event log

### Changed
- Rendering hierarchy refinements:
  - clearer title-bar structure for product name vs run status
  - improved enemy readability via thresholded HP-hit messages and tint cues
  - adjusted frame guardrail expectations for richer terminal layout

## [0.2.0] - 2026-03-21

### Added
- Major visual redesign pass:
  - upgraded tile/tower/enemy symbols
  - ANSI color mapping for grid and HUD entities
  - framed dashboard composition (title bar, grid, HUD, controls, event log)
  - title screen and ceremony-style victory/game-over layouts

### Changed
- Map/path presentation evolved from a simple line into a non-linear S-curve route to improve readability and tactical placement space.

## [0.1.0] - 2026-03-21

### Added
- Initial playable terminal-native tower defense MVP:
  - Node.js + TypeScript + Ink runtime
  - deterministic tick loop and simulation pipeline
  - two tower archetypes (RAPID, CANNON)
  - two enemy archetypes (STANDARD, TANK)
  - wave spawning, economy rewards/costs, base damage/leaks
  - win/lose phase states and core HUD
  - keyboard controls for selection, placement, wave start, and quit

### Tested
- Initial automated coverage for simulation systems (combat, movement, placement, economy, wave flow, end-state handling) plus rendering/input guardrails.
