import { describe, expect, test } from 'vitest';
import { spawnSync } from 'node:child_process';
import { getDisplayWidth } from '../../src/rendering/text-utils';

const CSI_ESCAPE = /\x1b\[[0-9;?]*[A-Za-z]/g;
const OSC_ESCAPE = /\x1b\][^\x07]*(?:\x07|\x1b\\)/g;

type FrameMetrics = {
  width: number;
  height: number;
};

const getFrameMetrics = (lines: string[]): FrameMetrics => {
  const width = Math.max(...lines.map((line) => getDisplayWidth(line)));

  return {
    width,
    height: lines.length
  };
};

const collectGameplayWindows = (output: string): string[][] => {
  const lines = output
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);
  const windows: string[][] = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].includes('Wave 9/15') || !lines[index].includes('Crossroads')) {
      continue;
    }

    windows.push(lines.slice(index, index + 30));
  }

  return windows;
};

describe('PTY crossroads wave-9 repro harness', () => {
  test('captures stable dimensions across successive dense frames in PTY', () => {
    const harnessPath = `${process.cwd()}/tests/helpers/pty-crossroads-wave9-repro.tsx`;
    const tsxBin = `${process.cwd()}/node_modules/.bin/tsx`;
    const pythonProgram = [
      'import base64, fcntl, os, pty, select, struct, subprocess, sys, termios, time',
      `cmd = [${JSON.stringify(tsxBin)}, ${JSON.stringify(harnessPath)}]`,
      'master, slave = pty.openpty()',
      "fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', 33, 78, 0, 0))",
      'env = os.environ.copy()',
      "env['FORCE_COLOR'] = '0'",
      "env['REDUCED_MOTION'] = '1'",
      `proc = subprocess.Popen(cmd, cwd=${JSON.stringify(process.cwd())}, stdin=slave, stdout=slave, stderr=slave, env=env)`,
      'os.close(slave)',
      'data = b""',
      'deadline = time.time() + 8',
      'while time.time() < deadline:',
      '    ready, _, _ = select.select([master], [], [], 0.05)',
      '    if master in ready:',
      '        try:',
      '            chunk = os.read(master, 4096)',
      '        except OSError:',
      '            break',
      '        if not chunk:',
      '            break',
      '        data += chunk',
      '    if proc.poll() is not None:',
      '        continue',
      'if proc.poll() is None:',
      '    proc.terminate()',
      '    try:',
      '        proc.wait(timeout=2)',
      '    except subprocess.TimeoutExpired:',
      '        proc.kill()',
      'while True:',
      '    ready, _, _ = select.select([master], [], [], 0)',
      '    if master not in ready:',
      '        break',
      '    try:',
      '        chunk = os.read(master, 4096)',
      '    except OSError:',
      '        break',
      '    if not chunk:',
      '        break',
      '    data += chunk',
      'os.close(master)',
      'sys.stdout.write(base64.b64encode(data).decode())',
      'sys.exit(proc.returncode or 0)'
    ].join('\n');

    const run = spawnSync('python3', ['-c', pythonProgram], {
      cwd: process.cwd(),
      encoding: 'utf8'
    });

    expect(run.error).toBeUndefined();
    expect(run.status).toBe(0);

    const raw = Buffer.from(run.stdout, 'base64').toString('utf8').replace(/\r/g, '');
    const visibleOutput = raw.replace(OSC_ESCAPE, '').replace(CSI_ESCAPE, '');
    const frameWindows = collectGameplayWindows(visibleOutput);

    expect(frameWindows.length).toBeGreaterThanOrEqual(6);

    const dimensions = frameWindows.map(getFrameMetrics);
    const uniqueDimensions = new Set(dimensions.map((dimension) => `${dimension.width}x${dimension.height}`));

    expect(uniqueDimensions.size).toBe(1);
    for (const dimension of dimensions) {
      expect(dimension.width).toBeLessThanOrEqual(78);
      expect(dimension.height).toBeLessThanOrEqual(33);
    }
  });
});
