# COMPONENTS KNOWLEDGE BASE

## OVERVIEW
`src/components/` is the React UI layer: screens, HUD panels, and terminal-width handling.

## STRUCTURE
```text
src/components/
├── GameplayFrame.tsx      # Main gameplay HUD composition
├── TitleScreen.tsx        # Title phase ceremony screen
├── ModeSelectScreen.tsx   # Operations/Anomaly mode selection
├── MapSelectScreen.tsx    # Operations map selection (Crossroads/TowerJunction)
├── EndStateScreen.tsx     # VICTORY/GAME_OVER ceremony screens
├── HudPanel.tsx           # Currency/HP/Wave status panel
├── EventLogPanel.tsx      # Last 2 events display
├── LegendLine.tsx         # Control legend bar
├── TitleBar.tsx           # Window title bar
└── use-terminal-width.ts  # Terminal resize detection hook
```

## WHERE TO LOOK
| Need | File | Why |
|------|------|-----|
| Main gameplay frame | `GameplayFrame.tsx` | Grid + HUD + event log composition |
| Title phase | `TitleScreen.tsx` | Any-key gate, branding |
| Mode selection | `ModeSelectScreen.tsx` | Operations vs Anomaly cursor UI |
| Map selection | `MapSelectScreen.tsx` | Operations map picker |
| End ceremony | `EndStateScreen.tsx` | Stats display, restart prompt |
| Status display | `HudPanel.tsx` | HP bar, gold, wave progress |
| Event display | `EventLogPanel.tsx` | 2-line recent event feed |
| Terminal width | `use-terminal-width.ts` | Resize handling for responsive layout |

## CONVENTIONS
- Screens switch on `state.phase` in `app.tsx`.
- Keep components pure renderers; state lives in `app.tsx` + simulation.
- Use semantic color tokens from `design-tokens.ts`.

## ANTI-PATTERNS
- Do not add business logic in components; use simulation handlers.
- Do not access `process.env` directly; pass via props.
