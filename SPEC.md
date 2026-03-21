# Terminal Tower Defense — Product & MVP Spec (v1)

## 1) Purpose
Build a **true terminal-native tower defense game** that runs directly in a terminal (not browser-based), feels good inside a **tmux pane**, and is practical for developers to install and play.

This spec captures agreed decisions and defines an execution-ready v1 MVP scope.

## 2) Product Direction

### Core Product Idea
- A real-time (or tick-based real-time-feeling) tower defense game rendered as terminal text.
- Designed for short sessions and low-friction launch from command line.
- Primary experience: playable while already working in terminal tooling.

### Primary Audience
- Developers and terminal-first users.

### Primary Use Context
- Played in standard terminal emulators.
- Should be usable in a tmux split/pane without requiring full-screen desktop game assumptions.

## 3) Explicit Decisions (Locked)

## 3.1 Tech Stack
- **Runtime:** Node.js
- **Language:** TypeScript
- **UI/Rendering Framework:** Ink
- **Render strategy:** Build each frame as **one text block string** (grid/world + HUD) and render as a single unit per tick/frame.

Rationale: aligns with TypeScript comfort, practical ecosystem support, and predictable terminal rendering behavior for a grid game.

## 3.2 Distribution & Business Stance
- Use **Option A**: do not optimize for code protection.
- Accept that JS/TS source protection is weak in practice.
- Focus on value delivery, gameplay quality, and developer distribution rather than obfuscation-heavy packaging.

## 3.3 Scope Boundaries
- **Multiplayer:** out of scope for v1.
- **Audio:** nice-to-have, not priority for v1.
- **Steam:** not immediate target; focus on terminal-native developer distribution first.

## 4) Platform & Delivery Constraints
- Runs as a terminal app (CLI entrypoint), not a web app.
- Must be readable and playable in common terminal sizes, including tmux pane contexts.
- Keep runtime dependencies and setup straightforward for Node users.

## 5) v1 MVP Definition

v1 MVP is complete when a user can install/run from terminal and play full rounds of tower defense with meaningful decisions and win/lose outcomes.

### 5.1 In-Scope Gameplay Requirements (MVP)
1. **Single playable map/path** with clearly traversed enemy route.
2. **Wave system** with increasing pressure over time.
3. **Economy loop**:
   - Currency earned from enemy kills.
   - Spending currency to place towers.
4. **Tower placement** on valid cells only.
5. **At least 2 tower archetypes** with distinct behavior (example: fast/low damage vs slow/high damage).
6. **At least 2 enemy archetypes** with distinct stats (example: normal vs tanky/fast).
7. **Combat resolution** with range, targeting, damage, enemy death, and base damage on leaks.
8. **Win/Lose states**:
   - Win after surviving all configured waves.
   - Lose when base HP reaches 0.
9. **In-terminal HUD** showing at minimum:
   - Base HP
   - Currency
   - Current wave / progress
10. **Controls for core actions**:
    - Start/advance wave flow as designed
    - Place tower type selection
    - Quit safely

### 5.2 Out of Scope (MVP)
- Multiplayer/networked play.
- Matchmaking/social systems.
- Steam platform integration.
- Advanced audio system.
- Cosmetics/progression meta beyond a single run.
- Anti-reverse-engineering hardening as a primary objective.

## 6) Technical Expectations for MVP
- TypeScript codebase running on Node.js.
- Ink-based app structure.
- Deterministic game tick/update loop suitable for terminal rendering.
- Frame composed to a single string block before render commit.
- Separation of concerns sufficient for maintainability:
  - game state/model
  - simulation/update logic
  - rendering formatter
  - input handling

## 7) UX & Terminal Readability Expectations
- Visual output prioritizes clarity over decoration.
- Symbols/characters chosen for legibility in default monospaced terminal fonts.
- HUD and playfield remain understandable in constrained pane widths/heights.
- Avoid UI patterns that rely on mouse or rich graphical widgets.

## 8) Acceptance Criteria (MVP)
The MVP is accepted when all are true:
1. Running the game from terminal reaches playable state without custom GUI.
2. A complete run can be finished with clear win/lose outcomes.
3. Player can place towers, enemies path and take damage, and economy updates correctly.
4. Display updates coherently frame-to-frame in terminal using the agreed text-block rendering approach.
5. Multiplayer, Steam integration, and advanced audio are not required for acceptance.

## 9) Post-MVP Candidates (Not committed)
- Audio polish.
- Additional maps/towers/enemy varieties.
- Balance passes and difficulty modes.
- Packaging/distribution improvements for broader audiences.

## 10) Handoff Note for Emet (Execution Planning Input)
Use this spec as the source of truth for implementation planning.

Planning should produce:
1. A phased implementation plan from project bootstrap to MVP acceptance.
2. Concrete milestones with test/verification points per milestone.
3. A minimal initial architecture aligned with Node + TypeScript + Ink and single-text-block frame rendering.
4. Explicit non-goal enforcement for multiplayer/Steam/advanced audio during MVP.
