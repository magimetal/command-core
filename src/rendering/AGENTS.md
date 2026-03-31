# RENDERING KNOWLEDGE BASE

## OVERVIEW
`src/rendering/` builds the terminal frame: ANSI composition, semantic text styles, and pane-safe layout math.

## STRUCTURE
```text
src/rendering/
├── grid-composer.ts     # 16x34 grid composition, entity placement, row strings
├── hud-composer.ts      # Currency, HP, wave status bar text
├── design-tokens.ts     # ANSI color maps, phase-based theming
├── text-utils.ts        # Width measurement, padding, centering (ANSI-aware)
├── text-styles.ts       # Semantic style application (enemy/tower/contextual)
├── hp-bar.ts            # HP bar string generation [████░░░░░]
├── border.ts            # Box-drawing border composition
└── accessibility.ts     # Screen reader / accessibility helpers
```

## WHERE TO LOOK
| Need | File | Why |
|------|------|-----|
| Grid row strings | `grid-composer.ts` | Entity symbol placement, row assembly |
| Status bar text | `hud-composer.ts` | HP, gold, wave number formatting |
| Color themes | `design-tokens.ts` | Phase colors, enemy/tower color maps |
| Layout math | `text-utils.ts` | Strip ANSI for width, pad, center |
| Semantic coloring | `text-styles.ts` | Apply styles by entity type/context |
| HP visualization | `hp-bar.ts` | Bracketed bar with fill ratio |
| Border drawing | `border.ts` | Unicode box-drawing characters |

## CONVENTIONS
- Always strip ANSI before width calculations.
- Keep frame output as single composed string block.
- Use semantic styles (context-aware) over direct color codes.
- Grid width 34 chars; total frame width <= 78 chars.

## ANTI-PATTERNS
- Do not emit multiple root writes; frame is one bordered block.
- Do not hardcode colors outside `design-tokens.ts`.
- Do not skip ANSI-stripping in layout math (breaks centering).
