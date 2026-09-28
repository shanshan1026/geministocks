interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

interface FixedProxy {
  prefix: string;
  origin: string;
}

const FIXED_PROXIES: FixedProxy[] = [
  { prefix: '/ollama-api', origin: 'https://ollama.com' },
  { prefix: '/exa-api', origin: 'https://api.exa.ai' },
  { prefix: '/anysearch-api', origin: 'https://api.anysearch.com' },
];

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function json(payload: unknown, status: number): Response {
  return Response.json(payload, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function isSameOriginRequest(request: Request): boolean {
  const requestOrigin = new URL(request.url).origin;
  const source = request.headers.get('Origin') || request.headers.get('Referer');
  if (!source) return false;

  try {
    return new URL(source).origin === requestOrigin;
  } catch {
    return false;
  }
}

function isDisallowedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');

  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host === 'metadata' ||
    host === 'metadata.google.internal'
  ) {
    return true;
  }

  if (
    /^0\./.test(host) ||
    /^10\./.test(host) ||
    /^127\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(host)
  ) {
    return true;
  }

  return (
    host === '::' ||
    host === '::1' ||
    host.startsWith('fc') ||
    host.startsWith('fd') ||
    host.startsWith('fe8') ||
    host.startsWith('fe9') ||
    host.startsWith('fea') ||
    host.startsWith('feb') ||
    host.startsWith('::ffff:127.') ||
    host.startsWith('::ffff:10.') ||
    host.startsWith('::ffff:192.168.') ||
    /^::ffff:172\.(1[6-9]|2\d|3[01])\./.test(host)
  );
}

function isRateLimited(request: Request): boolean {
  const now = Date.now();
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const bucket = rateBuckets.get(ip);

  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  if (rateBuckets.size > 5_000) {
    for (const [key, value] of rateBuckets) {
      if (now >= value.resetAt) rateBuckets.delete(key);
    }
  }

  return bucket.count > RATE_LIMIT_MAX;
}

function upstreamHeaders(request: Request): Headers {
  const headers = new Headers(request.headers);
  for (const name of [
    'host',
    'connection',
    'content-length',
    'accept-encoding',
    'origin',
    'referer',
    'cf-connecting-ip',
    'cf-ipcountry',
    'cf-ray',
    'cf-visitor',
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
  ]) {
    headers.delete(name);
  }
  return headers;
}

function responseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  for (const name of ['content-type', 'cache-control', 'retry-after']) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set('X-Content-Type-Options', 'nosniff');
  return headers;
}

async function proxy(request: Request, target: URL): Promise<Response> {
  if (isRateLimited(request)) {
    return json({ error: 'Too many requests, please slow down' }, 429);
  }

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: upstreamHeaders(request),
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    });

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders(upstream),
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'Proxy fetch failed' },
      502,
    );
  }
}

function fixedProxyTarget(url: URL): URL | null {
  const match = FIXED_PROXIES.find(
    ({ prefix }) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`),
  );
  if (!match) return null;

  const path = url.pathname.slice(match.prefix.length) || '/';
  return new URL(`${path}${url.search}`, match.origin);
}

async function handleProxyRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const fixedTarget = fixedProxyTarget(url);

  if (fixedTarget) {
    if (!isSameOriginRequest(request)) {
      return json({ error: 'Forbidden: cross-site proxy use is not allowed' }, 403);
    }
    return proxy(request, fixedTarget);
  }

  if (url.pathname !== '/api/cors-proxy') return null;
  if (!isSameOriginRequest(request)) {
    return json({ error: 'Forbidden: cross-site proxy use is not allowed' }, 403);
  }

  let target: URL;
  try {
    target = new URL(url.searchParams.get('target') || '');
  } catch {
    return json({ error: 'Invalid or missing target URL' }, 400);
  }

  if (target.protocol !== 'https:') {
    return json({ error: 'Only https targets are allowed' }, 400);
  }
  if (isDisallowedHost(target.hostname)) {
    return json({ error: 'Target host not allowed' }, 403);
  }

  return proxy(request, target);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const proxyResponse = await handleProxyRequest(request);
    if (proxyResponse) return proxyResponse;

    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'API endpoint not available' }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
