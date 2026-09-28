// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getApiConfig,
  saveApiConfig,
  clearApiConfig,
  isApiConfigured,
  buildAuthHeaders,
  toRequestUrl,
  getChatCompletionsUrl,
} from './apiConfigService';

beforeEach(() => {
  localStorage.clear();
});

describe('buildAuthHeaders', () => {
  it('returns a Bearer header for a real key', () => {
    expect(buildAuthHeaders('sk-abc')).toEqual({ Authorization: 'Bearer sk-abc' });
  });

  it('returns no headers for empty or whitespace keys (local CLI mode)', () => {
    expect(buildAuthHeaders('')).toEqual({});
    expect(buildAuthHeaders('   ')).toEqual({});
  });
});

describe('saveApiConfig / getApiConfig round-trip', () => {
  it('persists and restores a config', () => {
    saveApiConfig({ baseUrl: 'https://openrouter.ai/api/v1', apiKey: 'sk-1', model: 'gpt-4o' });
    expect(getApiConfig()).toEqual({
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: 'sk-1',
      model: 'gpt-4o',
    });
    expect(isApiConfigured()).toBe(true);
  });

  it('normalizes trailing slashes and a pasted /chat/completions endpoint', () => {
    saveApiConfig({
      baseUrl: 'https://api.example.com/v1/chat/completions',
      apiKey: ' sk-2 ',
      model: ' deepseek-chat ',
    });
    const config = getApiConfig();
    expect(config?.baseUrl).toBe('https://api.example.com/v1');
    expect(config?.apiKey).toBe('sk-2');
    expect(config?.model).toBe('deepseek-chat');
  });

  it('normalizes a trailing slash on the base URL', () => {
    saveApiConfig({ baseUrl: 'http://localhost:11434/v1/', apiKey: '', model: 'llama3' });
    expect(getApiConfig()?.baseUrl).toBe('http://localhost:11434/v1');
  });

  it('returns null when nothing is stored', () => {
    expect(getApiConfig()).toBeNull();
    expect(isApiConfigured()).toBe(false);
  });

  it('returns null for corrupted JSON', () => {
    localStorage.setItem('user-api-config', '{not json');
    expect(getApiConfig()).toBeNull();
  });

  it('returns null when required fields are missing', () => {
    localStorage.setItem('user-api-config', JSON.stringify({ baseUrl: '', model: 'x', apiKey: 'k' }));
    expect(getApiConfig()).toBeNull();
    localStorage.setItem('user-api-config', JSON.stringify({ baseUrl: 'https://a.com', model: '', apiKey: 'k' }));
    expect(getApiConfig()).toBeNull();
  });

  it('coerces a missing apiKey to an empty string (legacy configs)', () => {
    localStorage.setItem('user-api-config', JSON.stringify({ baseUrl: 'https://a.com/v1', model: 'm' }));
    expect(getApiConfig()?.apiKey).toBe('');
  });

  it('clearApiConfig removes the stored config', () => {
    saveApiConfig({ baseUrl: 'https://a.com/v1', apiKey: 'k', model: 'm' });
    clearApiConfig();
    expect(getApiConfig()).toBeNull();
  });
});

describe('toRequestUrl (CORS proxy routing)', () => {
  it('keeps relative URLs as-is (already same-origin proxies)', () => {
    expect(toRequestUrl('/ollama-api/v1/models')).toBe('/ollama-api/v1/models');
    expect(toRequestUrl('/anysearch-api/v1/search')).toBe('/anysearch-api/v1/search');
  });

  it('keeps localhost and private-network hosts direct (browser must reach them)', () => {
    expect(toRequestUrl('http://localhost:3456/v1/models')).toBe('http://localhost:3456/v1/models');
    expect(toRequestUrl('http://127.0.0.1:11434/v1')).toBe('http://127.0.0.1:11434/v1');
    expect(toRequestUrl('http://192.168.1.10:8080/v1')).toBe('http://192.168.1.10:8080/v1');
    expect(toRequestUrl('http://10.0.0.5:1234/v1')).toBe('http://10.0.0.5:1234/v1');
    expect(toRequestUrl('http://172.16.0.2:9000/v1')).toBe('http://172.16.0.2:9000/v1');
    expect(toRequestUrl('http://my-box.local:1455/v1')).toBe('http://my-box.local:1455/v1');
  });

  it('routes remote absolute URLs through the same-origin CORS proxy', () => {
    const url = 'https://api.deepseek.com/v1/chat/completions';
    expect(toRequestUrl(url)).toBe(`/api/cors-proxy?target=${encodeURIComponent(url)}`);
  });

  it('does not treat 172.32.x.x (outside private range) as local', () => {
    const url = 'http://172.32.0.1/v1';
    expect(toRequestUrl(url)).toBe(`/api/cors-proxy?target=${encodeURIComponent(url)}`);
  });
});

describe('getChatCompletionsUrl', () => {
  it('appends /chat/completions and proxies remote hosts', () => {
    const result = getChatCompletionsUrl({ baseUrl: 'https://openrouter.ai/api/v1', apiKey: 'k', model: 'm' });
    expect(result).toBe(`/api/cors-proxy?target=${encodeURIComponent('https://openrouter.ai/api/v1/chat/completions')}`);
  });

  it('keeps local CLI endpoints direct', () => {
    const result = getChatCompletionsUrl({ baseUrl: 'http://localhost:20128/v1', apiKey: '', model: 'm' });
    expect(result).toBe('http://localhost:20128/v1/chat/completions');
  });
});
