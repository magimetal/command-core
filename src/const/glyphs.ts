/**
 * Glyph audit (Phase 0 baseline + final polish notes)
 *
 * Candidate grid glyphs validated as single-cell in runtime width math (`getDisplayWidth === 1`):
 * ▸ U+25B8, ■ U+25A0, ◂ U+25C2, ▲ U+25B2, ◆ U+25C6, ☠ U+2620.
 *
 * Safety tiers:
 * - ASCII_SAFE: Plain ASCII fallback glyphs
 * - LATIN_EXT: Extended Latin symbols
 * - BOX_DRAWING: Box drawing / line symbols
 * - BLOCK: Block + geometric symbols used in grid/HUD
 * - UNICODE_MISC: Other single-cell Unicode symbols
 */
export const GLYPH = {
  HP_FULL: '❤',
  HP_LOW: '♡',
  HP_CRITICAL: '☠',
  GOLD: '✦',
  WAVE: '≋',
  RUN_PREFIX: '◈',
  SEPARATOR: '⟫',
  MENU_ARROW: '▶',
  THREAT_LABEL: '⚠ THREAT',
  SURGE_BADGE: '◆ SURGE',
  CURSOR_RETICLE: '◎',
  EVENT_DIVIDER: '╌',
  EVENTS_LABEL: 'Events',
  SCROLL_UP: '↑',
  PROGRESS_FILL: '━',
  PROGRESS_CURSOR: '▸',
  WARNING: '⚠'
} as const;

export type GlyphTier = 'ASCII_SAFE' | 'LATIN_EXT' | 'BOX_DRAWING' | 'BLOCK' | 'UNICODE_MISC';

export const ENEMY_GLYPH_REGISTRY = {
  STANDARD: { primary: '▸', fallback: 'S', tier: 'BLOCK' },
  TANK: { primary: '■', fallback: 'T', tier: 'BLOCK' },
  FAST: { primary: '◂', fallback: 'F', tier: 'BLOCK' },
  BRUTE: { primary: '▲', fallback: 'B', tier: 'BLOCK' },
  COLOSSUS: { primary: '◆', fallback: 'C', tier: 'BLOCK' }
} as const satisfies Record<string, { primary: string; fallback: string; tier: GlyphTier }>;
