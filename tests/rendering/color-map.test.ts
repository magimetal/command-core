import { describe, expect, test } from 'vitest';
import { getDisplayWidth, truncateDisplay } from '../../src/rendering/color-map';

describe('color-map text metrics hardening', () => {
  test('measures display width for ASCII, CJK, and emoji glyphs', () => {
    expect(getDisplayWidth('abc')).toBe(3);
    expect(getDisplayWidth('古')).toBe(2);
    expect(getDisplayWidth('✅')).toBe(2);
  });

  test('treats width-safe enemy glyphs as single-column symbols', () => {
    expect(getDisplayWidth('S')).toBe(1);
    expect(getDisplayWidth('F')).toBe(1);
    expect(getDisplayWidth('T')).toBe(1);
    expect(getDisplayWidth('B')).toBe(1);
    expect(getDisplayWidth('C')).toBe(1);
  });

  test('truncates by visible display width with ellipsis', () => {
    expect(truncateDisplay('Anomaly #1234567890', 12)).toBe('Anomaly #12…');
    expect(truncateDisplay('古古古古', 5)).toBe('古古…');
  });

  test('drops ANSI codes when fitting truncated text', () => {
    const ansi = '\u001b[31mALERT MESSAGE\u001b[0m';
    expect(truncateDisplay(ansi, 6)).toBe('ALERT…');
  });
});
