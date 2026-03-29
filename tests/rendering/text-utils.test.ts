import { describe, expect, test } from 'vitest';
import chalk from 'chalk';
import { truncateDisplay } from '../../src/rendering/text-utils';

describe('truncateDisplay', () => {
  test('preserves ANSI styling when text already fits maxWidth', () => {
    const previousLevel = chalk.level;
    chalk.level = 3;

    const styled = chalk.bold.red('FAST');
    const result = truncateDisplay(styled, 10);

    chalk.level = previousLevel;

    expect(result).toBe(styled);
  });
});
