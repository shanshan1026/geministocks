# Security Policy 安全策略

## How user API keys are handled 用户 API Key 的处理方式

Super Digger is a **Bring Your Own Model (BYOM)** application. This is the trust model:

- **Model API keys** (OpenRouter, DeepSeek, Exa, AnySearch, etc.) are stored in the browser's `localStorage` only. They are never written to cookies, never sent to our analytics, and never stored on any server.
- **Requests to model providers** go directly from your browser to the provider. For providers that block browser CORS, requests pass through a stateless same-origin proxy (`api/cors-proxy.ts` or the rewrites in `vercel.json`) that forwards them **without logging or persisting** headers or bodies.
- **Analysis history and settings** are stored in `localStorage` on your device.

Relevant code to audit:

| Concern | File |
| --- | --- |
| Key storage & config | `services/apiConfigService.ts` |
| Model API calls | `services/streamingService.ts` |
| Real-time search calls | `services/exaSearchService.ts` |
| CORS proxy | `api/cors-proxy.ts`, `vercel.json` (rewrites) |

## Notes for self-hosters 自部署注意事项

- Review the protections in `api/cors-proxy.ts` before deploying: it enforces same-site usage, https-only targets, and blocks SSRF to private hosts. Verify these fit your domain — an open proxy can be abused by third parties on your quota.
- The optional `OPENROUTER_API_KEY` env var (see `.env.example`) is only used by the optional server-side endpoint `api/ai-analyze.ts`. If you set it, that key is **yours as the deployer** and will be spent by anyone who can reach the endpoint — protect it or leave it unset.
- Security headers (CSP, HSTS, etc.) are configured in `vercel.json`.

## Reporting a vulnerability 报告安全漏洞

Please email **codes@z.org** with a description and reproduction steps. Do not open a public issue for undisclosed vulnerabilities. We aim to respond within 7 days.

请将漏洞描述与复现步骤发送至 **codes@z.org**，在漏洞未修复前请勿公开 Issue。我们会在 7 天内响应。
