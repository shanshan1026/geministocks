import { describe, it, expect } from 'vitest';
import { analysisReportToMarkdown } from './markdownService';
import type { AnalysisReport } from '../types';

// Minimal but realistic report fixture covering the fields the exporter touches
const baseReport: AnalysisReport = {
  summary: 'Overall summary text.',
  investmentScore: { score: 82, reason: 'Attractive setup.' },
  informationGapScore: { score: 65, reason: 'Partially priced in.' },
  analysis: {
    marketSentiment: { sentiment: 'Positive', description: 'Positive momentum.' },
    industryChain: {
      upstream: [{ name: 'Supplier A', description: 'Provides materials.' }],
      midstream: [],
      downstream: [{ name: 'OEM B', description: 'Assembles product.' }],
    },
  },
  marketSizeAndOutlook: {
    narrative: 'Growing market.',
  },
  scenarioAnalysis: [],
  investmentStrategy: {
    logic: 'Core logic.',
    suggestion: 'Suggested approach.',
  },
  tieredSuggestions: {
    coreHoldings: [{ name: 'Alpha Corp', ticker: 'ALPH', reason: 'Market leader.' }],
    strategicSatellites: [],
    watchlist: [],
  },
} as AnalysisReport;

describe('analysisReportToMarkdown', () => {
  it('includes both scores with reasons', () => {
    const md = analysisReportToMarkdown(baseReport, 'test topic');
    expect(md).toContain('## Investment Score: 82/100');
    expect(md).toContain('Attractive setup.');
    expect(md).toContain('## Information Gap Score: 65/100');
    expect(md).toContain('Partially priced in.');
  });

  it('omits the information gap section when absent (older reports)', () => {
    const { informationGapScore: _omitted, ...rest } = baseReport;
    const md = analysisReportToMarkdown(rest as AnalysisReport, 'test topic');
    expect(md).not.toContain('Information Gap Score');
    expect(md).toContain('## Investment Score: 82/100');
  });

  it('renders real-time sources with dates as markdown links', () => {
    const report: AnalysisReport = {
      ...baseReport,
      realTimeSources: [
        { title: 'Fresh News', url: 'https://news.example.com/a', publishedDate: '2026-08-01T09:00:00Z' },
        { title: 'No Date', url: 'https://news.example.com/b' },
      ],
    };
    const md = analysisReportToMarkdown(report, 'test topic');
    expect(md).toContain('## Real-time Search Sources');
    expect(md).toContain('- [Fresh News](https://news.example.com/a) (2026-08-01)');
    expect(md).toContain('- [No Date](https://news.example.com/b)');
  });

  it('omits the real-time sources section when there are none', () => {
    const md = analysisReportToMarkdown(baseReport, 'test topic');
    expect(md).not.toContain('Real-time Search Sources');
  });

  it('includes the source topic and structural sections', () => {
    const md = analysisReportToMarkdown(baseReport, 'my input topic');
    expect(md).toContain('> Source: my input topic');
    expect(md).toContain('## Overall Summary');
    expect(md).toContain('**Sentiment:** Positive');
    expect(md).toContain('### Upstream');
    expect(md).toContain('- **Supplier A**: Provides materials.');
    expect(md).toContain('### Tier 1: Core Holdings');
    expect(md).toContain('- **Alpha Corp** (ALPH): Market leader.');
  });
});
