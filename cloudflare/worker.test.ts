import { afterEach, describe, expect, it, vi } from 'vitest';
import worker from './worker';

const assets = {
  fetch: vi.fn(async () => new Response('asset', { status: 200 })),
};

afterEach(() => {
  vi.restoreAllMocks();
  assets.fetch.mockClear();
});

describe('Cloudflare Worker', () => {
  it('serves non-proxy requests from static assets', async () => {
    const response = await worker.fetch(new Request('https://331026.xyz/'), { ASSETS: assets });

    expect(await response.text()).toBe('asset');
    expect(assets.fetch).toHaveBeenCalledOnce();
  });

  it('rejects cross-site use of the generic proxy', async () => {
    const request = new Request(
      'https://331026.xyz/api/cors-proxy?target=https%3A%2F%2Fexample.com%2Fv1',
      { headers: { Origin: 'https://attacker.example' } },
    );

    const response = await worker.fetch(request, { ASSETS: assets });

    expect(response.status).toBe(403);
  });

  it('blocks private-network targets', async () => {
    const request = new Request(
      'https://331026.xyz/api/cors-proxy?target=https%3A%2F%2F127.0.0.1%2Fsecret',
      { headers: { Origin: 'https://331026.xyz' } },
    );

    const response = await worker.fetch(request, { ASSETS: assets });

    expect(response.status).toBe(403);
  });

  it('maps fixed search proxy paths and streams the upstream response', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response('search result', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('https://331026.xyz/exa-api/search?q=chips', {
      headers: {
        Origin: 'https://331026.xyz',
        Authorization: 'Bearer user-key',
      },
    });
    const response = await worker.fetch(request, { ASSETS: assets });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('search result');
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://api.exa.ai/search?q=chips');
  });

  it('does not route disabled Vercel API endpoints to the SPA', async () => {
    const response = await worker.fetch(
      new Request('https://331026.xyz/api/ai-analyze', {
        method: 'POST',
        headers: { Origin: 'https://331026.xyz' },
      }),
      { ASSETS: assets },
    );

    expect(response.status).toBe(404);
    expect(assets.fetch).not.toHaveBeenCalled();
  });
});
