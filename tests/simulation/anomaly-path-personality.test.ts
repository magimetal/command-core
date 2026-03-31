import { describe, expect, test } from 'vitest';
import { generatePathAttempt, hasBacktrackMoves, hasPhaseTransitions, PathPersonality } from '../../src/simulation/anomaly-path';
import type { GridPos } from '../../src/models/cell';

describe('path personality generation', () => {
  test('CLASSIC personality produces East-dominant paths', () => {
    // Seed 0 is expected to be CLASSIC based on weight distribution
    const path = generatePathAttempt(0, 0);
    expect(path).not.toBeNull();

    // Count East vs West moves
    let eastMoves = 0;
    let westMoves = 0;
    for (let i = 1; i < path!.length; i++) {
      const dc = path![i][0] - path![i - 1][0];
      if (dc === 1) eastMoves++;
      if (dc === -1) westMoves++;
    }

    expect(eastMoves).toBeGreaterThan(westMoves * 3);
  });

  test('all path personalities produce valid paths with retry logic', () => {
    // This test simulates the retry behavior of anomaly-gen.ts
    let successCount = 0;
    const failedSeeds: number[] = [];

    for (let seed = 0; seed < 50; seed += 1) {
      let path = generatePathAttempt(seed, 0);
      let attempt = 0;

      // Try up to 20 attempts (matching anomaly-gen.ts behavior)
      while (!path && attempt < 20) {
        attempt++;
        path = generatePathAttempt(seed, attempt);
      }

      if (path && path.length >= 56) {
        successCount++;

        // Validate continuity
        for (let i = 1; i < path.length; i++) {
          const dist = Math.abs(path[i][0] - path[i - 1][0]) + Math.abs(path[i][1] - path[i - 1][1]);
          expect(dist).toBe(1);
        }

        // Validate bounds
        path.forEach(([col, row]) => {
          expect(col).toBeGreaterThanOrEqual(0);
          expect(col).toBeLessThan(34);
          expect(row).toBeGreaterThanOrEqual(0);
          expect(row).toBeLessThan(16);
        });
      } else {
        failedSeeds.push(seed);
      }
    }

    // Accept if we have >85% success rate with retry logic
    const successRate = successCount / 50;
    console.log(`Path generation success rate: ${(successRate * 100).toFixed(1)}%`);
    console.log('Failed seeds:', failedSeeds);
    expect(successRate).toBeGreaterThanOrEqual(0.85);
  });

  test('validate individual seeds', () => {
    // Test a variety of seeds that should work
    for (const seed of [0, 1, 7, 42, 99]) {
      let path = generatePathAttempt(seed, 0);
      let attempt = 0;
      while (!path && attempt < 20) {
        attempt++;
        path = generatePathAttempt(seed, attempt);
      }

      expect(path).not.toBeNull();
      expect(path!.length).toBeGreaterThanOrEqual(56);

      // Validate continuity
      for (let i = 1; i < path!.length; i++) {
        const dist = Math.abs(path![i][0] - path![i - 1][0]) + Math.abs(path![i][1] - path![i - 1][1]);
        expect(dist).toBe(1);
      }

      // Validate bounds
      path!.forEach(([col, row]) => {
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(34);
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(16);
      });
    }
  });

  test('path personalities are distributed across seeds', () => {
    // Track path signatures to detect variety
    const signatures = new Set<string>();

    for (let seed = 0; seed < 100; seed += 1) {
      let path = generatePathAttempt(seed, 0);
      let attempt = 0;
      while (!path && attempt < 20) {
        attempt++;
        path = generatePathAttempt(seed, attempt);
      }

      if (path) {
        // Create a simple signature based on first 10 waypoints
        const signature = path
          .slice(0, 10)
          .map(([col, row]) => `${col}:${row}`)
          .join('|');
        signatures.add(signature);
      }
    }

    // With 5 personalities, we expect at least 4 distinct signature patterns
    expect(signatures.size).toBeGreaterThanOrEqual(4);
  });

  test('BACKTRACK personality produces paths with West movement', () => {
    // Find a BACKTRACK seed by scanning for paths with backtrack moves
    let backtrackPath: GridPos[] | null = null;
    let backtrackSeed = -1;

    for (let seed = 0; seed < 100 && !backtrackPath; seed++) {
      let path = generatePathAttempt(seed, 0);
      let attempt = 0;
      while (!path && attempt < 20) {
        attempt++;
        path = generatePathAttempt(seed, attempt);
      }

      if (path && hasBacktrackMoves(path, 5)) {
        backtrackPath = path;
        backtrackSeed = seed;
      }
    }

    expect(backtrackPath).not.toBeNull();
    expect(backtrackSeed).toBeGreaterThanOrEqual(0);
  });

  test('SPIRAL personality produces paths with phase transitions', () => {
    // Find a SPIRAL seed by scanning for paths with high phase transitions
    let spiralPath: GridPos[] | null = null;

    for (let seed = 0; seed < 100 && !spiralPath; seed++) {
      let path = generatePathAttempt(seed, 0);
      let attempt = 0;
      while (!path && attempt < 20) {
        attempt++;
        path = generatePathAttempt(seed, attempt);
      }

      if (path && hasPhaseTransitions(path, 8)) {
        spiralPath = path;
      }
    }

    expect(spiralPath).not.toBeNull();
  });

  test('ZIGZAG_INTENSE personality produces high vertical move count', () => {
    // Find a ZIGZAG seed by scanning for paths with high vertical movement
    let zigzagPath: GridPos[] | null = null;

    for (let seed = 0; seed < 100 && !zigzagPath; seed++) {
      let path = generatePathAttempt(seed, 0);
      let attempt = 0;
      while (!path && attempt < 20) {
        attempt++;
        path = generatePathAttempt(seed, attempt);
      }

      let verticalMoves = 0;
      if (path) {
        for (let i = 1; i < path.length; i++) {
          if (path[i][1] !== path[i - 1][1]) verticalMoves++;
        }
        if (verticalMoves >= 20) {
          zigzagPath = path;
        }
      }
    }

    expect(zigzagPath).not.toBeNull();
  });

  test('MULTI_PASS personality produces paths visiting multiple zones', () => {
    // Find a MULTI_PASS seed by scanning for paths with column distribution
    let multiPassPath: GridPos[] | null = null;

    for (let seed = 0; seed < 100 && !multiPassPath; seed++) {
      let path = generatePathAttempt(seed, 0);
      let attempt = 0;
      while (!path && attempt < 20) {
        attempt++;
        path = generatePathAttempt(seed, attempt);
      }

      if (path) {
        const colsVisited = new Set(path.map(([c]) => {
          if (c <= 11) return 0;
          if (c <= 22) return 1;
          return 2;
        }));
        if (colsVisited.size >= 2) {
          multiPassPath = path;
        }
      }
    }

    expect(multiPassPath).not.toBeNull();
  });

  test('hasBacktrackMoves correctly counts West moves', () => {
    const testPath: GridPos[] = [[0, 0], [1, 0], [2, 0], [1, 0], [2, 0], [3, 0], [2, 0], [1, 0]];
    expect(hasBacktrackMoves(testPath, 2)).toBe(true);
    expect(hasBacktrackMoves(testPath, 5)).toBe(false);
  });

  test('hasPhaseTransitions correctly counts direction changes', () => {
    const testPath: GridPos[] = [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [3, 2], [3, 3], [4, 3]];
    // Direction changes: 4 (East->East->South->South->East->South->East)
    expect(hasPhaseTransitions(testPath, 2)).toBe(true);
    expect(hasPhaseTransitions(testPath, 10)).toBe(false);
  });

  test('PathPersonality enum has all 5 values', () => {
    const personalities = Object.values(PathPersonality);
    expect(personalities).toContain('CLASSIC');
    expect(personalities).toContain('SPIRAL');
    expect(personalities).toContain('BACKTRACK');
    expect(personalities).toContain('ZIGZAG_INTENSE');
    expect(personalities).toContain('MULTI_PASS');
    expect(personalities.length).toBe(5);
  });

  test('personality selection is deterministic for same seed', () => {
    for (let seed = 0; seed < 20; seed++) {
      const path1 = generatePathAttempt(seed, 0);
      const path2 = generatePathAttempt(seed, 0);

      expect(path1).toEqual(path2);
    }
  });

  test('different attempts with same seed produce different paths', () => {
    const seed = 42;
    const path1 = generatePathAttempt(seed, 0);
    const path2 = generatePathAttempt(seed, 1);

    // Different attempts should produce different paths (or null)
    expect(path1).not.toEqual(path2);
  });
});
