import { describe, it, expect } from 'vitest';
import { computeExitPressure, pressureBand } from './sentimentUtils';

describe('computeExitPressure', () => {
  it('returns null when both inputs are missing', () => {
    expect(computeExitPressure(null, null)).toBeNull();
  });

  it('cheap valuation gates news euphoria out of the high bands', () => {
    // Even maximum news crowding cannot exceed the gate at low percentiles
    const score = computeExitPressure(20, 100);
    expect(score).not.toBeNull();
    expect(score!).toBeLessThan(30); // stays in "calm"
  });

  it('stretched valuation with euphoric news yields extreme pressure', () => {
    const score = computeExitPressure(95, 90);
    expect(score!).toBeGreaterThanOrEqual(75); // "extreme"
  });

  it('stretched valuation alone (no news scan) yields only moderate pressure', () => {
    const score = computeExitPressure(100, null);
    expect(score!).toBeLessThanOrEqual(50);
    expect(score!).toBeGreaterThanOrEqual(40); // base pressure from valuation
  });

  it('news score alone assumes neutral valuation (P50 gate)', () => {
    const withNews = computeExitPressure(null, 80);
    expect(withNews!).toBeGreaterThan(0);
    expect(withNews!).toBeLessThan(30); // heavily gated at P50
  });

  it('is monotonic in the buffett percentile', () => {
    const low = computeExitPressure(60, 70)!;
    const mid = computeExitPressure(75, 70)!;
    const high = computeExitPressure(90, 70)!;
    expect(mid).toBeGreaterThan(low);
    expect(high).toBeGreaterThan(mid);
  });

  it('clamps out-of-range inputs', () => {
    expect(computeExitPressure(150, 200)).toBeLessThanOrEqual(100);
    expect(computeExitPressure(-10, -5)).toBe(0);
  });
});

describe('pressureBand', () => {
  it('maps scores to bands with correct boundaries', () => {
    expect(pressureBand(null)).toBeNull();
    expect(pressureBand(0)).toBe('calm');
    expect(pressureBand(29)).toBe('calm');
    expect(pressureBand(30)).toBe('elevated');
    expect(pressureBand(54)).toBe('elevated');
    expect(pressureBand(55)).toBe('high');
    expect(pressureBand(74)).toBe('high');
    expect(pressureBand(75)).toBe('extreme');
    expect(pressureBand(100)).toBe('extreme');
  });
});
