const reducedMotionValues = new Set(['1', 'true', 'yes', 'on']);

export const isReducedMotionEnabled = (): boolean => {
  const value = process.env.REDUCED_MOTION;
  if (value === undefined) {
    return false;
  }

  return reducedMotionValues.has(value.trim().toLowerCase());
};
