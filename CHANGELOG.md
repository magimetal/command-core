# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows semantic-style milestone versioning for seeded history.

## [Unreleased]

### Added
- Beta-pass gameplay and presentation features:
  - New tower archetypes: **SNIPER** and **SLOW** (now 4 total)
  - New enemy archetype: **FAST** (now 3 total)
  - Tower selling flow (`S`) with sell logging
  - Cursor placement helpers: ghost tower preview + visible range ring (`◌`)
  - Cosmetic projectile rendering for active shots
  - End-state scoring surfaced in ceremony screens

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

### Tested
- Expanded automated coverage for redesign and beta-pass mechanics:
  - rendering checks for path topology, range ring behavior, ghost cursor, projectile glyphs, and frame guardrails
  - simulation checks for FAST movement cadence, SLOW debuff behavior, sell flow/economy safety, and score calculation
  - input checks for expanded controls (`1-4`, `S`, title gating, quit precedence)

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
