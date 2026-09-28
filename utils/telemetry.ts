// Lightweight local diagnostics — console-only, no external SDK.
// Replaces the former optional Sentry integration: in a BYOK app all analysis
// happens client-side with the user's own keys, so shipping a 460 kB error
// tracker was not worth the weight. Breadcrumbs are kept in a small ring
// buffer so captureError can attach recent context to the console output.

interface Breadcrumb {
  category: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

const MAX_BREADCRUMBS = 20;
const breadcrumbs: Breadcrumb[] = [];

/** Record a diagnostic breadcrumb (kept in memory, attached to future errors). */
export function addBreadcrumb(category: string, message: string, data?: Record<string, unknown>): void {
  breadcrumbs.push({ category, message, data, timestamp: new Date().toISOString() });
  if (breadcrumbs.length > MAX_BREADCRUMBS) breadcrumbs.shift();
}

/** Log an error with recent breadcrumbs for context. */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  console.error('[telemetry]', error.message, {
    context,
    breadcrumbs: breadcrumbs.slice(-5),
    stack: error.stack,
  });
}

/** Expose recent breadcrumbs (useful for tests and debugging). */
export function getBreadcrumbs(): readonly Breadcrumb[] {
  return breadcrumbs;
}
