// Shared indicator-scan logic: prompt builders + response parsers.
// Framework-free and environment-free (no browser APIs, no process.env),
// consumed by services/geminiService.ts (user's own model) and unit tests.

import type { SentimentScanResult } from './sentimentUtils';
import type { TacoScanResult } from './tacoUtils';

export interface ScanArticle {
  title: string;
  description: string;
  sourceName: string;
}

/** Strip HTML tags without relying on DOMParser (works in browser and Node). */
export const stripToPlainText = (html: string): string =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

/** Numbered article list fed to both scanners. */
export const buildArticlePrompt = (articles: ScanArticle[]): string =>
  articles
    .map((a, i) => `${i}. [${a.sourceName}] ${a.title} — ${stripToPlainText(a.description).slice(0, 150)}`)
    .join('\n');

const langName = (locale: 'zh' | 'en'): string => (locale === 'zh' ? 'Simplified Chinese' : 'English');

export const buildSentimentInstruction = (locale: 'zh' | 'en'): string => {
  const lang = langName(locale);
  return `You are a contrarian sell-side behavior analyst. Scan the numbered financial news items for INSTITUTIONAL TOP-SIGNAL behaviors:
1. "targetPriceRaises" — analysts/institutions raising target prices or price forecasts, especially in clusters
2. "consensusBullish" — crowded unanimous bullish language ("all analysts agree", "strong buy consensus", price targets chasing price)
3. "goodNewsFatigue" — stocks/indices failing to rally on good earnings or positive news (buyers exhausted)
4. "institutionalRetreat" — funds/insiders reducing positions while ratings stay bullish
5. "externalBlame" — narratives blaming declines on external factors (deleveraging, rates, war) while avoiding fundamentals

For EACH signal give: strength 0-100 (0 = absent, 100 = pervasive across many items) and one-sentence evidence in ${lang} citing which news items support it (or state it is absent).
Then give "newsScore" 0-100: the aggregate crowding/euphoria level implied by this news window (high = crowded consensus + top signals present; low = fear/neutral/no signals). Be conservative: sparse or ambiguous evidence must yield low strengths.
Respond STRICTLY in JSON. Schema: {"newsScore": number, "signals": [{"key": "string (one of the five keys above)", "strength": number, "evidence": "string"}]}`;
};

export const buildTacoInstruction = (locale: 'zh' | 'en'): string => {
  const lang = langName(locale);
  return `You are a policy-game analyst tracking the "TACO" pattern (Trump Always Chickens Out: aggressive tariff/trade threat -> market panic -> walk-back/pause/deal -> rally). Scan the numbered financial news items for FIVE signals:
1. "threatEscalation" — NEW tariff/trade/sanction threats or escalation rhetoric from Trump or the US administration
2. "marketPanic" — markets actually selling off or panicking in response to trade threats (not generic volatility)
3. "walkback" — softening: pauses, exemptions, "great deal" announcements, deadline extensions, retreat from threats
4. "complacency" — markets/commentators explicitly IGNORING or dismissing threats ("markets shrugged off", "investors have learned", muted reaction to new threats)
5. "tacoMentions" — media explicitly naming/discussing the TACO pattern or trade itself ("TACO trade", "Trump always chickens out", "buy the tariff dip" as known strategy)

For EACH signal give: strength 0-100 (0 = absent in this window, 100 = pervasive) and one-sentence evidence in ${lang} citing which items support it (or state it is absent). Signals are about the CURRENT window only — do not use outside knowledge of past cycles. Be conservative: sparse or ambiguous evidence must yield low strengths.
Respond STRICTLY in JSON. Schema: {"signals": [{"key": "string (one of the five keys)", "strength": number, "evidence": "string"}]}`;
};

const SENTIMENT_KEYS = ['targetPriceRaises', 'consensusBullish', 'goodNewsFatigue', 'institutionalRetreat', 'externalBlame'];
const TACO_KEYS = ['threatEscalation', 'marketPanic', 'walkback', 'complacency', 'tacoMentions'];

const clamp01to100 = (n: unknown): number => Math.min(100, Math.max(0, Number(n) || 0));

const parseSignals = (raw: unknown, validKeys: string[]): { key: string; strength: number; evidence: string }[] =>
  (Array.isArray(raw) ? raw : [])
    .filter((s: any) => validKeys.includes(s?.key))
    .map((s: any) => ({
      key: String(s.key),
      strength: clamp01to100(s.strength),
      evidence: String(s.evidence || '').slice(0, 300),
    }));

/** Parse + clamp a raw AI response into a SentimentScanResult. Pure - unit tested. */
export const parseSentimentResponse = (data: any, articleCount: number, scannedAt?: string): SentimentScanResult => ({
  newsScore: clamp01to100(data?.newsScore),
  signals: parseSignals(data?.signals, SENTIMENT_KEYS),
  scannedAt: scannedAt ?? new Date().toISOString(),
  articleCount,
});

/** Parse + clamp a raw AI response into a TacoScanResult. Pure - unit tested. */
export const parseTacoResponse = (data: any, articleCount: number, scannedAt?: string): TacoScanResult => ({
  signals: parseSignals(data?.signals, TACO_KEYS),
  scannedAt: scannedAt ?? new Date().toISOString(),
  articleCount,
});
