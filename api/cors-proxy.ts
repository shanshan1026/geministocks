import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Generic same-origin CORS proxy.
 *
 * Many OpenAI-compatible providers (and relay services) do not return
 * Access-Control-Allow-Origin headers, so the browser cannot call them
 * directly (it reports "Failed to fetch"). The frontend routes those requests
 * through this proxy: GET/POST /api/cors-proxy?target=<absolute https url>.
 *
 * The dev/preview environment uses the equivalent dynamic proxy configured in
 * vite.config.ts. This function is the production (Vercel) counterpart.
 *
 * Security: only https targets to public hosts are allowed (blocks SSRF to
 * localhost / private network ranges).
 */

function isDisallowedHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  return (
    h === 'localhost' ||
    h === '0.0.0.0' ||
    h === '::1' ||
    h.endsWith('.local') ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  )
}

/**
 * Same-origin check: only pages served by this deployment may use the proxy.
 * Browsers send Origin (cross-origin & same-origin POST) and/or Referer.
 * Requests originating from other sites are rejected, which prevents third
 * parties from embedding this endpoint as a free relay.
 */
function isSameOrigin(req: VercelRequest): boolean {
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString().split(',')[0].trim()
  if (!host) return false
  const check = (value: string | undefined): boolean | null => {
    if (!value) return null
    try {
      return new URL(value).host === host
    } catch {
      return false
    }
  }
  const originOk = check(req.headers.origin as string | undefined)
  if (originOk !== null) return originOk
  const refererOk = check(req.headers.referer as string | undefined)
  if (refererOk !== null) return refererOk
  // No Origin/Referer at all (e.g. curl): reject — real browser calls from our
  // frontend always include at least one of them for fetch requests.
  return false
}

// Simple in-memory per-IP rate limit (best-effort on serverless: state lives per
// warm instance, but it still throttles bursts from a single abuser).
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 60 // max requests per IP per minute
const rateBuckets = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const bucket = rateBuckets.get(ip)
  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  bucket.count++
  if (rateBuckets.size > 5000) {
    // Prevent unbounded growth: drop expired buckets
    for (const [k, v] of rateBuckets) {
      if (now >= v.resetAt) rateBuckets.delete(k)
    }
  }
  return bucket.count > RATE_LIMIT_MAX
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Only allow calls from our own frontend pages
  if (!isSameOrigin(req)) {
    res.status(403).json({ error: 'Forbidden: cross-site use of this proxy is not allowed' })
    return
  }

  // Per-IP rate limiting
  const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || 'unknown'
  if (isRateLimited(ip)) {
    res.status(429).json({ error: 'Too many requests, please slow down' })
    return
  }

  const target = (Array.isArray(req.query.target) ? req.query.target[0] : req.query.target) || ''

  let targetUrl: URL
  try {
    targetUrl = new URL(target)
  } catch {
    res.status(400).json({ error: 'Invalid or missing target URL' })
    return
  }

  if (targetUrl.protocol !== 'https:') {
    res.status(400).json({ error: 'Only https targets are allowed' })
    return
  }
  if (isDisallowedHost(targetUrl.hostname)) {
    res.status(403).json({ error: 'Target host not allowed' })
    return
  }

  // Forward request headers, dropping hop-by-hop / host-specific ones
  const headers: Record<string, string> = {}
  for (const [k, v] of Object.entries(req.headers)) {
    const key = k.toLowerCase()
    if (['host', 'connection', 'content-length', 'accept-encoding', 'origin', 'referer'].includes(key)) continue
    if (typeof v === 'string') headers[k] = v
    else if (Array.isArray(v)) headers[k] = v.join(', ')
  }

  let body: string | undefined
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body != null) {
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    if (!headers['content-type']) headers['content-type'] = 'application/json'
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body,
    })

    const buf = Buffer.from(await upstream.arrayBuffer())
    res.status(upstream.status)
    const contentType = upstream.headers.get('content-type')
    if (contentType) res.setHeader('content-type', contentType)
    res.send(buf)
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Proxy fetch failed' })
  }
}
