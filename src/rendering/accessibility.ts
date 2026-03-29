const reducedMotionValues = new Set(['1', 'true', 'yes', 'on']);
const reducedGlyphValues = new Set(['1', 'true', 'yes', 'on']);

export const isReducedMotionEnabled = (): boolean => {
  const value = process.env.REDUCED_MOTION;
  if (value === undefined) {
    return false;
  }

  return reducedMotionValues.has(value.trim().toLowerCase());
};

export const isReducedGlyphEnabled = (): boolean => {
  const value = process.env.REDUCED_GLYPH;
  if (value === undefined) {
    return false;
  }

  return reducedGlyphValues.has(value.trim().toLowerCase());
};
