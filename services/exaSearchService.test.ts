// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getExaConfig,
  saveExaConfig,
  isExaSearchEnabled,
  formatExaResultsForPrompt,
  searchExa,
  type ExaResult,
} from './exaSearchService';

const CONFIG_KEY = 'exa-search-config';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getExaConfig', () => {
  it('returns safe defaults when nothing is stored', () => {
    expect(getExaConfig()).toEqual({
      provider: 'exa',
      apiKey: '',
      anysearchApiKey: '',
      enabled: false,
    });
  });

  it('is backward compatible with legacy Exa-only configs', () => {
    // Older versions stored only { apiKey, enabled }
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ apiKey: 'k-123', enabled: true }));
    const config = getExaConfig();
    expect(config.provider).toBe('exa');
    expect(config.apiKey).toBe('k-123');
    expect(config.anysearchApiKey).toBe('');
    expect(config.enabled).toBe(true);
  });

  it('falls back to defaults on corrupted JSON', () => {
    localStorage.setItem(CONFIG_KEY, '{not valid json');
    expect(getExaConfig().provider).toBe('exa');
    expect(getExaConfig().enabled).toBe(false);
  });

  it('normalizes unknown providers to exa', () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ provider: 'bing', enabled: true, apiKey: 'x' }));
    expect(getExaConfig().provider).toBe('exa');
  });
});

describe('saveExaConfig', () => {
  it('disables the toggle when Exa is selected without a key', () => {
    saveExaConfig({ provider: 'exa', apiKey: '  ', anysearchApiKey: '', enabled: true });
    expect(getExaConfig().enabled).toBe(false);
  });

  it('allows AnySearch to stay enabled without a key (anonymous tier)', () => {
    saveExaConfig({ provider: 'anysearch', apiKey: '', anysearchApiKey: '', enabled: true });
    expect(getExaConfig().enabled).toBe(true);
  });

  it('trims keys before persisting', () => {
    saveExaConfig({ provider: 'exa', apiKey: '  k-1  ', anysearchApiKey: ' a-1 ', enabled: true });
    const config = getExaConfig();
    expect(config.apiKey).toBe('k-1');
    expect(config.anysearchApiKey).toBe('a-1');
  });
});

describe('isExaSearchEnabled', () => {
  it('requires a key for Exa', () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ provider: 'exa', apiKey: '', enabled: true }));
    expect(isExaSearchEnabled()).toBe(false);
  });

  it('does not require a key for AnySearch', () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ provider: 'anysearch', enabled: true }));
    expect(isExaSearchEnabled()).toBe(true);
  });

  it('is false when the toggle is off regardless of provider', () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ provider: 'anysearch', enabled: false }));
    expect(isExaSearchEnabled()).toBe(false);
  });
});

describe('searchExa provider routing and mapping', () => {
  it('maps AnySearch results (code/data.results shape) to the unified structure', async () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ provider: 'anysearch', enabled: true }));
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 0,
          data: {
            results: [
              { title: 'News A', url: 'https://a.com', snippet: 'short  text' },
              { title: '', url: 'https://b.com', content: 'long   content   here' },
            ],
          },
        }),
        { status: 200 }
      )
    );

    const { ok, results } = await searchExa('test topic', 2);
    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('/anysearch-api/v1/search', expect.anything());
    expect(results[0]).toMatchObject({ title: 'News A', url: 'https://a.com', text: 'short text' });
    // Empty title falls back to url; whitespace in content is collapsed
    expect(results[1]).toMatchObject({ title: 'https://b.com', text: 'long content here' });
  });

  it('surfaces AnySearch business errors (non-zero code)', async () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ provider: 'anysearch', enabled: true }));
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ code: 429, message: 'quota exceeded' }), { status: 200 })
    );

    const { ok, message } = await searchExa('test');
    expect(ok).toBe(false);
    expect(message).toContain('quota exceeded');
  });

  it('routes to the Exa endpoint when provider is exa', async () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ provider: 'exa', apiKey: 'k-1', enabled: true }));
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ results: [{ title: 'T', url: 'https://x.com' }] }), { status: 200 })
    );

    const { ok, results } = await searchExa('test');
    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('/exa-api/search', expect.anything());
    expect(results[0].title).toBe('T');
  });

  it('fails fast for Exa without an API key (no network call)', async () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ provider: 'exa', apiKey: '', enabled: true }));
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    const { ok, message } = await searchExa('test');
    expect(ok).toBe(false);
    expect(message).toContain('not configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('formatExaResultsForPrompt', () => {
  const results: ExaResult[] = [
    { title: 'Title 1', url: 'https://a.com', publishedDate: '2026-08-01', text: 'body  text' },
    { title: 'Title 2', url: 'https://b.com' },
  ];

  it('returns empty string for no results', () => {
    expect(formatExaResultsForPrompt([], 'zh')).toBe('');
  });

  it('numbers each result and includes url/date/excerpt', () => {
    const block = formatExaResultsForPrompt(results, 'en');
    expect(block).toContain('[1] Title 1');
    expect(block).toContain('[2] Title 2');
    expect(block).toContain('URL: https://a.com');
    expect(block).toContain('Published: 2026-08-01');
    expect(block).toContain('Excerpt: body text');
  });

  it('localizes labels for Chinese', () => {
    const block = formatExaResultsForPrompt(results, 'zh');
    expect(block).toContain('发布日期: 2026-08-01');
    expect(block).toContain('摘要: body text');
  });
});
