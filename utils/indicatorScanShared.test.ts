import { describe, it, expect } from 'vitest';
import {
  buildArticlePrompt,
  parseSentimentResponse,
  parseTacoResponse,
  stripToPlainText,
} from './indicatorScanShared';

describe('stripToPlainText', () => {
  it('removes HTML tags and collapses whitespace', () => {
    expect(stripToPlainText('<p>Hello <b>world</b></p>\n\n  extra')).toBe('Hello world extra');
  });
});

describe('buildArticlePrompt', () => {
  it('numbers articles and includes source names', () => {
    const prompt = buildArticlePrompt([
      { title: 'A', description: 'desc a', sourceName: 'CNBC' },
      { title: 'B', description: 'desc b', sourceName: '雪球' },
    ]);
    expect(prompt).toContain('0. [CNBC] A');
    expect(prompt).toContain('1. [雪球] B');
  });

  it('truncates long descriptions to 150 chars', () => {
    const prompt = buildArticlePrompt([
      { title: 'T', description: 'x'.repeat(500), sourceName: 'S' },
    ]);
    // 150 chars of description max (plus prefix)
    expect(prompt.length).toBeLessThan(200);
  });
});

describe('parseSentimentResponse', () => {
  it('clamps newsScore and filters invalid signal keys', () => {
    const result = parseSentimentResponse(
      {
        newsScore: 150,
        signals: [
          { key: 'targetPriceRaises', strength: -5, evidence: 'e1' },
          { key: 'notARealKey', strength: 50, evidence: 'e2' },
          { key: 'consensusBullish', strength: 80, evidence: 'e3' },
        ],
      },
      10
    );
    expect(result.newsScore).toBe(100);
    expect(result.signals).toHaveLength(2);
    expect(result.signals[0].strength).toBe(0);
    expect(result.articleCount).toBe(10);
  });

  it('handles malformed responses gracefully', () => {
    const result = parseSentimentResponse(null, 0);
    expect(result.newsScore).toBe(0);
    expect(result.signals).toEqual([]);
  });

  it('uses provided scannedAt timestamp', () => {
    const ts = '2026-01-01T00:00:00.000Z';
    expect(parseSentimentResponse({}, 5, ts).scannedAt).toBe(ts);
  });
});

describe('parseTacoResponse', () => {
  it('filters to valid taco keys and clamps strengths', () => {
    const result = parseTacoResponse(
      {
        signals: [
          { key: 'walkback', strength: 999, evidence: 'e' },
          { key: 'targetPriceRaises', strength: 50, evidence: 'wrong indicator key' },
          { key: 'tacoMentions', strength: 42.7, evidence: 'e' },
        ],
      },
      8
    );
    expect(result.signals.map(s => s.key)).toEqual(['walkback', 'tacoMentions']);
    expect(result.signals[0].strength).toBe(100);
    expect(result.articleCount).toBe(8);
  });

  it('truncates evidence to 300 chars', () => {
    const result = parseTacoResponse(
      { signals: [{ key: 'complacency', strength: 10, evidence: 'y'.repeat(999) }] },
      1
    );
    expect(result.signals[0].evidence).toHaveLength(300);
  });
});
