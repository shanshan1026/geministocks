import { describe, it, expect } from 'vitest';
import { deriveTacoPhase, computeEdgeDecay, decayBand, type TacoSignal } from './tacoUtils';

const sig = (key: string, strength: number): TacoSignal => ({ key, strength, evidence: '' });

describe('deriveTacoPhase', () => {
  it('returns quiet when no signals are present', () => {
    expect(deriveTacoPhase([]).phase).toBe('quiet');
  });

  it('returns quiet when all phase signals are below the active threshold', () => {
    const { phase } = deriveTacoPhase([
      sig('threatEscalation', 20),
      sig('marketPanic', 10),
      sig('walkback', 29),
      sig('complacency', 15),
    ]);
    expect(phase).toBe('quiet');
  });

  it('picks the dominant phase signal', () => {
    const { phase } = deriveTacoPhase([
      sig('threatEscalation', 40),
      sig('marketPanic', 85),
      sig('walkback', 20),
    ]);
    expect(phase).toBe('panic');
  });

  it('breaks ties in cycle order (earlier phase wins)', () => {
    const { phase } = deriveTacoPhase([
      sig('threatEscalation', 60),
      sig('walkback', 60),
    ]);
    expect(phase).toBe('threat');
  });

  it('detects complacency as a standalone phase', () => {
    const { phase } = deriveTacoPhase([
      sig('threatEscalation', 25),
      sig('complacency', 70),
    ]);
    expect(phase).toBe('complacency');
  });

  it('confidence rises with dominance', () => {
    const dominant = deriveTacoPhase([sig('marketPanic', 90), sig('threatEscalation', 10)]);
    const contested = deriveTacoPhase([sig('marketPanic', 90), sig('threatEscalation', 85)]);
    expect(dominant.confidence).toBeGreaterThan(contested.confidence);
  });

  it('ignores tacoMentions for phase determination', () => {
    const { phase } = deriveTacoPhase([sig('tacoMentions', 95)]);
    expect(phase).toBe('quiet');
  });

  it('clamps out-of-range strengths', () => {
    const { phase } = deriveTacoPhase([sig('walkback', 250)]);
    expect(phase).toBe('walkback');
  });
});

describe('computeEdgeDecay', () => {
  it('returns 0 with no signals', () => {
    expect(computeEdgeDecay([])).toBe(0);
  });

  it('weights tacoMentions at 60% and complacency at 40%', () => {
    expect(computeEdgeDecay([sig('tacoMentions', 100), sig('complacency', 0)])).toBe(60);
    expect(computeEdgeDecay([sig('tacoMentions', 0), sig('complacency', 100)])).toBe(40);
    expect(computeEdgeDecay([sig('tacoMentions', 100), sig('complacency', 100)])).toBe(100);
  });

  it('ignores unrelated signals', () => {
    expect(computeEdgeDecay([sig('marketPanic', 100), sig('threatEscalation', 100)])).toBe(0);
  });
});

describe('decayBand', () => {
  it('maps decay to bands with correct boundaries', () => {
    expect(decayBand(0)).toBe('fresh');
    expect(decayBand(34)).toBe('fresh');
    expect(decayBand(35)).toBe('known');
    expect(decayBand(64)).toBe('known');
    expect(decayBand(65)).toBe('crowded');
    expect(decayBand(100)).toBe('crowded');
  });
});
