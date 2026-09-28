import { describe, it, expect } from 'vitest';
import {
  mergeIndicatorArticles,
  ENGLISH_FINANCE_SOURCES,
  THERMOMETER_QUERIES,
  TACO_QUERIES,
  type IndicatorArticle,
} from './indicatorNewsService';

const art = (title: string, sourceName = 'RSS'): IndicatorArticle => ({
  title,
  description: 'desc',
  sourceName,
});

describe('mergeIndicatorArticles', () => {
  it('keeps search articles first, then RSS', () => {
    const merged = mergeIndicatorArticles(
      [art('Search Hit', 'Web Search')],
      [art('RSS Item')],
      10
    );
    expect(merged.map(a => a.title)).toEqual(['Search Hit', 'RSS Item']);
  });

  it('dedupes identical titles across search and RSS (search wins)', () => {
    const merged = mergeIndicatorArticles(
      [art('Trump Announces New Tariffs', 'Web Search')],
      [art('Trump Announces New Tariffs', 'CNBC')],
      10
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].sourceName).toBe('Web Search');
  });

  it('dedupes titles that differ only in punctuation/case', () => {
    const merged = mergeIndicatorArticles(
      [art('Markets Shrug Off Tariff Threat!', 'Web Search')],
      [art('markets shrug off tariff threat', 'CNBC')],
      10
    );
    expect(merged).toHaveLength(1);
  });

  it('respects the total cap', () => {
    const search = Array.from({ length: 5 }, (_, i) => art(`Search ${i}`, 'Web Search'));
    const rss = Array.from({ length: 5 }, (_, i) => art(`RSS ${i}`));
    expect(mergeIndicatorArticles(search, rss, 6)).toHaveLength(6);
  });

  it('skips articles with empty titles', () => {
    const merged = mergeIndicatorArticles([art('')], [art('Valid Title')], 10);
    expect(merged).toHaveLength(1);
    expect(merged[0].title).toBe('Valid Title');
  });

  it('handles CJK titles in dedupe normalization', () => {
    const merged = mergeIndicatorArticles(
      [art('特朗普宣布新关税：市场暴跌', 'Web Search')],
      [art('特朗普宣布新关税 市场暴跌', 'RSS')],
      10
    );
    expect(merged).toHaveLength(1);
  });

  it('returns empty array when both inputs are empty', () => {
    expect(mergeIndicatorArticles([], [], 10)).toEqual([]);
  });
});

describe('constants', () => {
  it('English finance pack has valid source shapes', () => {
    expect(ENGLISH_FINANCE_SOURCES.length).toBeGreaterThanOrEqual(3);
    for (const s of ENGLISH_FINANCE_SOURCES) {
      expect(s.id).toBeTruthy();
      expect(s.url).toMatch(/^https:\/\//);
    }
  });

  it('both indicators have targeted query lists', () => {
    expect(THERMOMETER_QUERIES.length).toBeGreaterThanOrEqual(3);
    expect(TACO_QUERIES.length).toBeGreaterThanOrEqual(3);
    // TACO queries must cover the meme-density signal
    expect(TACO_QUERIES.join(' ')).toMatch(/TACO/);
  });
});
