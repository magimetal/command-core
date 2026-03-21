# MVP Process Record — Terminal Tower Defense

This document captures how the project moved from concept to the current polished MVP, including decisions, tradeoffs, and what changed between iterations.

## 1) Initial Concept

The original goal was to build a **real terminal-native tower defense game** that feels good inside normal terminal workflows (including tmux), not a browser game styled like a terminal.

Core product intent from day one:

- short-session play loop
- low-friction launch from CLI
- meaningful tactical decisions (placement + wave timing)
- readable output in constrained terminal panes

## 2) Stack + Distribution Decisions

From spec and planning:

- Runtime: **Node.js**
- Language: **TypeScript**
- UI framework: **Ink**
- Rendering strategy: compose each frame as a single terminal text block

Distribution/business decision: prioritize shipping playable value over source-code protection/obfuscation. Multiplayer, Steam integration, and advanced audio were explicitly deferred out of MVP.

## 3) Spec + Planning Process

### Source artifacts

- `SPEC.md` (repo)
- `~/.plans/terminal-tower-defense-mvp-plan.md`
- `~/.plans/terminal-tower-defense-visual-redesign.md`
- `~/.plans/terminal-tower-defense-iteration-2.md`

### Planning shape

The MVP plan was phased (bootstrap → map/path → combat → economy/waves → win/lose + HUD → polish), with explicit guardrails:

- fixed tick-order contract
- manual wave start (`Space`) as a deliberate strategic choice
- terminal/tmux fit constraints
- non-goals enforced (no multiplayer/Steam/audio scope creep)

## 4) MVP Implementation (First Complete Playable)

The first complete implementation delivered the full gameplay loop:

- static map and path traversal
- tower placement and two archetypes
- enemy spawning and wave progression
- kill rewards and placement costs
- game phases + victory/game-over states
- terminal HUD and controls
- automated tests for core simulation paths

This established correctness and end-to-end playability, but the early presentation felt more like a debug surface than a finished terminal experience.

## 5) Why the Early MVP Felt Weak

Before the visual redesign pass, the game had several UX issues called out in planning diagnostics:

- low visual separation between entities
- compressed information density (HUD/legend hard to scan)
- weak cursor visibility during active play
- sparse/noisy feedback for action outcomes
- minimal onboarding and low ceremony for title/end states

Impact: the mechanics worked, but readability and feel lagged behind the quality of the simulation core.

## 6) Redesign Pass 1 (Major Visual Iteration)

The first redesign focused on presentation layer upgrades while preserving core gameplay mechanics.

Key outcomes implemented:

- upgraded symbol set (towers/enemies/tiles)
- full color mapping via ANSI/chalk integration
- framed dashboard layout (title bar, grid, HUD, controls, event log)
- non-linear S-curve path to improve spatial strategy and visual interest
- title screen and stronger ceremony-style end-state screens
- event-log system introduced into game state/presentation

Result: the game moved from “functional prototype” to “coherent terminal-native experience.”

## 7) Iteration Pass 2 (Polish + Feedback Clarity)

Second iteration targeted high-impact feel issues without introducing new mechanics.

Implemented outcomes:

- richer event stream (wave start/clear, kills, leaks, placement feedback)
- event classes with color differentiation
- increased log capacity and better empty-state treatment
- stronger cursor contrast + cursor coordinate display in HUD
- clearer section hierarchy (controls vs event log)
- enemy HP readability improvements through threshold hit messages and tinting
- title-bar hierarchy cleanup

Result: player feedback became immediate and interpretable under real-time pressure.

## 8) Tradeoffs and Lessons Learned

### What worked

- **Simulation/rendering separation** kept polish iterations fast and low-risk.
- **Phased planning with guardrails** prevented scope drift.
- **Manual wave trigger** added meaningful prep agency in a terminal format.

### Tradeoffs made

- Chose deterministic, direct simulation over advanced animation systems.
- Focused on one map and compact archetype set for MVP depth-over-breadth.
- Kept mechanics stable during polish passes to avoid regressions while refining feel.

### Practical lesson

In terminal games, readability and event feedback are gameplay-critical, not cosmetic. Visual clarity materially changes decision quality and player confidence.

## 9) Current Status

Current build is a complete terminal-native MVP with:

- full run loop (title → prep/waves → victory/game over)
- mechanically distinct towers/enemies
- event-driven, colorized in-terminal dashboard presentation
- test coverage for core game behavior and rendering guardrails

The project now has a stable gameplay core, a distinctive terminal presentation, and a documented change history suitable for next-step expansion.
