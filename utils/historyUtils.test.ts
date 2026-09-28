import { describe, it, expect } from 'vitest';
import { filterHistory, sortHistory, type DisplayHistoryItem } from './historyUtils';

const items: DisplayHistoryItem[] = [
  { id: 100, text: '固态电池', score: 85, gapScore: 90 },
  { id: 200, text: 'AI 芯片', score: 92, gapScore: 40 },
  { id: 300, text: '折叠屏手机', score: 60 }, // no gapScore (older report)
  { id: 400, text: 'Solid-state battery supply chain' }, // no scores at all
];

describe('filterHistory', () => {
  it('matches case-insensitively', () => {
    expect(filterHistory(items, 'solid-STATE')).toHaveLength(1);
    expect(filterHistory(items, 'solid-STATE')[0].id).toBe(400);
  });

  it('matches CJK substrings', () => {
    const result = filterHistory(items, '电池');
    expect(result.map((i) => i.id)).toEqual([100]);
  });

  it('returns everything for an empty term', () => {
    expect(filterHistory(items, '')).toHaveLength(4);
  });

  it('skips malformed entries without a text field', () => {
    const dirty = [...items, { id: 500 } as DisplayHistoryItem];
    expect(filterHistory(dirty, '')).toHaveLength(4);
  });
});

describe('sortHistory', () => {
  it('newest mode sorts by id descending', () => {
    expect(sortHistory(items, 'newest').map((i) => i.id)).toEqual([400, 300, 200, 100]);
  });

  it('score mode sorts by investment score, unscored entries last', () => {
    expect(sortHistory(items, 'score').map((i) => i.id)).toEqual([200, 100, 300, 400]);
  });

  it('gapScore mode sorts by information gap, missing gap scores last', () => {
    const ids = sortHistory(items, 'gapScore').map((i) => i.id);
    expect(ids.slice(0, 2)).toEqual([100, 200]);
    expect(ids.slice(2)).toEqual(expect.arrayContaining([300, 400]));
  });

  it('a real score of 0 still outranks a missing score', () => {
    const withZero: DisplayHistoryItem[] = [
      { id: 1, text: 'zero', score: 0 },
      { id: 2, text: 'none' },
    ];
    expect(sortHistory(withZero, 'score')[0].id).toBe(1);
  });

  it('does not mutate the input array', () => {
    const copy = [...items];
    sortHistory(items, 'score');
    expect(items).toEqual(copy);
  });
});
