import chalk from 'chalk';

export const stylePrimary = (s: string): string => chalk.bold.cyanBright(s);
export const styleSubtle = (s: string): string => chalk.dim.white(s);
export const styleEmphasis = (s: string): string => chalk.bold.white(s);
export const styleAnomaly = (s: string): string => chalk.bold.magentaBright(s);
export const styleSurge = (s: string): string => chalk.bold.yellowBright(s);
export const styleThreat = (s: string): string => chalk.bold.redBright(s);
