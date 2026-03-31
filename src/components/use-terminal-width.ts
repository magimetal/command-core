import { useStdout } from 'ink';

interface UseTerminalWidthOptions {
  min?: number;
  max?: number;
  override?: number;
}

export const useTerminalWidth = (options: UseTerminalWidthOptions = {}): number => {
  const { stdout } = useStdout();
  const { min = 56, max = 76, override } = options;
  const terminalColumns = override ?? stdout?.columns ?? process.stdout.columns ?? 78;

  return Math.max(min, Math.min(max, terminalColumns - 2));
};
