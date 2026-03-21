# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows semantic-style milestone versioning for seeded history.

## [Unreleased]

### Added
- Seeded project documentation set:
  - `README.md` (project overview, usage, controls, architecture)
  - `MVP.md` (process and decision record)
  - `CHANGELOG.md` (milestone history)

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
