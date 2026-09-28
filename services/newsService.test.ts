import { describe, it, expect } from 'vitest';
import { applySourcePrefs, moveId, type NewsSource } from './newsService';

const src = (id: string): NewsSource => ({ id, name: id.toUpperCase(), url: `https://example.com/${id}` });
const ids = (list: NewsSource[]) => list.map(s => s.id);

const SOURCES = [src('a'), src('b'), src('c'), src('d')];

describe('applySourcePrefs', () => {
  it('returns natural order when prefs are empty', () => {
    expect(ids(applySourcePrefs(SOURCES, { order: [], hidden: [] }))).toEqual(['a', 'b', 'c', 'd']);
  });

  it('filters user-hidden sources', () => {
    expect(ids(applySourcePrefs(SOURCES, { order: [], hidden: ['b', 'd'] }))).toEqual(['a', 'c']);
  });

  it('sorts by order list, unlisted ids keep natural order after listed ones', () => {
    expect(ids(applySourcePrefs(SOURCES, { order: ['c', 'a'], hidden: [] }))).toEqual(['c', 'a', 'b', 'd']);
  });

  it('applies hide and order together', () => {
    expect(ids(applySourcePrefs(SOURCES, { order: ['d', 'b'], hidden: ['a'] }))).toEqual(['d', 'b', 'c']);
  });

  it('ignores stale ids in prefs (removed sources)', () => {
    expect(ids(applySourcePrefs(SOURCES, { order: ['zombie', 'b'], hidden: ['ghost'] }))).toEqual(['b', 'a', 'c', 'd']);
  });

  it('does not mutate the input array', () => {
    const input = [...SOURCES];
    applySourcePrefs(input, { order: ['d'], hidden: ['a'] });
    expect(ids(input)).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('moveId', () => {
  it('moves an id forward', () => {
    expect(moveId(['a', 'b', 'c', 'd'], 'a', 'c')).toEqual(['b', 'c', 'a', 'd']);
  });

  it('moves an id backward', () => {
    expect(moveId(['a', 'b', 'c', 'd'], 'd', 'b')).toEqual(['a', 'd', 'b', 'c']);
  });

  it('returns the same array when ids are missing or identical', () => {
    const input = ['a', 'b', 'c'];
    expect(moveId(input, 'x', 'b')).toBe(input);
    expect(moveId(input, 'b', 'x')).toBe(input);
    expect(moveId(input, 'b', 'b')).toBe(input);
  });
});
