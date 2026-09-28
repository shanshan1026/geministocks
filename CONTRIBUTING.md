# Contributing 贡献指南

Thanks for your interest! 感谢你的关注！Issues and PRs are welcome in **English or 中文**.

## Getting started 本地开发

```bash
git clone https://github.com/yaoleifly/geministocks.git
cd geministocks
pnpm install
pnpm dev           # http://localhost:3000
```

No environment variables are needed. Configure a model via the in-app **API Settings** (any OpenAI-compatible endpoint works, e.g. a local Ollama or 9Router).

## Before you submit a PR 提交 PR 前

1. **Typecheck, tests & build must pass 类型检查、测试与构建必须通过** (CI runs the same checks on every PR):

   ```bash
   pnpm typecheck
   pnpm test
   pnpm build
   ```

   New logic in `services/` or `utils/` should come with unit tests (Vitest, colocated `*.test.ts`). Pure-logic tests run in the node environment; add `// @vitest-environment happy-dom` at the top of the file if the code needs `localStorage`/DOM.

2. **Keep the BYOM principle 遵守 BYOM 原则** — never introduce code that sends user API keys or analysis content to any server other than the user's chosen model provider (see [SECURITY.md](SECURITY.md)).

3. **i18n** — all user-facing copy must exist in both `public/locales/zh.json` and `public/locales/en.json`. No hardcoded UI strings (bilingual inline ternaries on `locale` are acceptable for small labels, matching existing patterns).

4. **Scope** — one PR per feature/fix. UI changes should include a screenshot.

## Project conventions 项目约定

- React 19 function components + hooks; TypeScript strict; Tailwind for styling.
- Heavy or rarely-opened components (modals, report view) are lazy-loaded via `React.lazy` — keep it that way.
- Business logic lives in `services/`, not inside components.
- Persistent client state uses `localStorage` with a versioned key and graceful `try/catch` (see `services/apiConfigService.ts` for the pattern).

## Reporting bugs 报告问题

Open an issue with: what you did, what you expected, what happened, browser/OS, and the model provider you were using (never include your API keys! 切勿附带你的 API Key).
