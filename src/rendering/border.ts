import { stripAnsi } from './color-map';

export const SECTION_BREAK = '__DIVIDER__';

export const padVisibleLine = (line: string, width: number): string => {
  const visibleLength = stripAnsi(line).length;
  if (visibleLength >= width) {
    return line;
  }

  return `${line}${' '.repeat(width - visibleLength)}`;
};

export const padCenteredVisibleLine = (line: string, width: number): string => {
  const visibleLength = stripAnsi(line).length;
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
  options: { minInnerWidth?: number; align?: 'left' | 'center' } = {}
): string => {
  const { minInnerWidth = 0, align = 'left' } = options;
  const contentWidth = Math.max(...lines.map((line) => stripAnsi(line).length));
  const innerWidth = Math.max(contentWidth, minInnerWidth);
  const horizontal = '─'.repeat(innerWidth);

  return [
    `┌${horizontal}┐`,
    ...lines.map((line) => {
      if (line === SECTION_BREAK) {
        return `├${horizontal}┤`;
      }

      const paddedLine =
        align === 'center' ? padCenteredVisibleLine(line, innerWidth) : padVisibleLine(line, innerWidth);
      return `│${paddedLine}│`;
    }),
    `└${horizontal}┘`
  ].join('\n');
};
