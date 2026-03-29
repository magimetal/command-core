import { getDisplayWidth, truncateDisplay } from './color-map';

export const SECTION_BREAK = '__DIVIDER__';

const padVisibleLine = (line: string, width: number): string => {
  const visibleLength = getDisplayWidth(line);
  if (visibleLength >= width) {
    return line;
  }

  return `${line}${' '.repeat(width - visibleLength)}`;
};

const padCenteredVisibleLine = (line: string, width: number): string => {
  const visibleLength = getDisplayWidth(line);
  if (visibleLength >= width) {
    return line;
  }

  const totalPadding = width - visibleLength;
  const leftPadding = Math.floor(totalPadding / 2);
  const rightPadding = totalPadding - leftPadding;

  return `${' '.repeat(leftPadding)}${line}${' '.repeat(rightPadding)}`;
};

export const composeBorder = (
  lines: string[],
  options: {
    minInnerWidth?: number;
    maxInnerWidth?: number;
    align?: 'left' | 'center';
    contentWidth?: number;
  } = {}
): string => {
  const { minInnerWidth = 0, maxInnerWidth, align = 'left', contentWidth } = options;
  const measuredContentWidth =
    contentWidth === undefined ? Math.max(...lines.map((line) => getDisplayWidth(line))) : contentWidth;
  const desiredInnerWidth = Math.max(measuredContentWidth, minInnerWidth);
  const innerWidth =
    maxInnerWidth === undefined ? desiredInnerWidth : Math.max(1, Math.min(desiredInnerWidth, maxInnerWidth));
  const horizontal = '─'.repeat(innerWidth);

  return [
    `┌${horizontal}┐`,
    ...lines.map((line) => {
      if (line === SECTION_BREAK) {
        return `├${horizontal}┤`;
      }

      const fittedLine = getDisplayWidth(line) > innerWidth ? truncateDisplay(line, innerWidth) : line;
      const paddedLine =
        align === 'center'
          ? padCenteredVisibleLine(fittedLine, innerWidth)
          : padVisibleLine(fittedLine, innerWidth);
      return `│${paddedLine}│`;
    }),
    `└${horizontal}┘`
  ].join('\n');
};
