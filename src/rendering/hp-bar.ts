export const HP_BAR_SEGMENTS = 5;

export const renderHpBar = (hp: number, maxHp: number): string => {
  const ratio = maxHp > 0 ? hp / maxHp : 0;
  const filled = Math.max(0, Math.min(HP_BAR_SEGMENTS, Math.round(ratio * HP_BAR_SEGMENTS)));

  return '█'.repeat(filled) + '░'.repeat(HP_BAR_SEGMENTS - filled);
};

export const renderWideHpBar = (hp: number, maxHp: number, barWidth: number): string => {
  if (barWidth <= 0 || maxHp <= 0) {
    return '';
  }

  const ratio = hp / maxHp;
  const filled = Math.max(0, Math.min(barWidth, Math.round(ratio * barWidth)));

  return '█'.repeat(filled) + '░'.repeat(barWidth - filled);
};
