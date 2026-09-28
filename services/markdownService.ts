
import type { AnalysisReport, StockAnalysisReport, PositionalWarfareReport, TieredSuggestions, IndustryChain } from '../types';

// Helper functions for building Markdown strings
const h1 = (text: string) => `# ${text}\n\n`;
const h2 = (text: string) => `## ${text}\n\n`;
const h3 = (text: string) => `### ${text}\n\n`;
const blockquote = (text: string) => `> ${text}\n\n`;
const list = (items: string[]) => items.map(item => `- ${item}`).join('\n') + '\n\n';
const bold = (text: string) => `**${text}**`;
const table = (headers: string[], rows: (string | number | null | undefined)[][]) => {
    let md = `| ${headers.join(' | ')} |\n`;
    md += `| ${headers.map(() => '---').join(' | ')} |\n`;
    rows.forEach(row => {
        md += `| ${row.map(cell => cell ?? 'N/A').join(' | ')} |\n`;
    });
    return md + '\n';
};

const tieredSuggestionsToMarkdown = (suggestions: TieredSuggestions): string => {
    let md = '';
    if (suggestions.coreHoldings?.length) {
        md += h3('Tier 1: Core Holdings');
        suggestions.coreHoldings.forEach(s => {
            md += `- ${bold(s.name)} (${s.ticker}): ${s.reason}\n`;
        });
        md += '\n';
    }
    if (suggestions.strategicSatellites?.length) {
        md += h3('Tier 2: Strategic Satellites');
        suggestions.strategicSatellites.forEach(s => {
            md += `- ${bold(s.name)} (${s.ticker}): ${s.reason}\n`;
        });
        md += '\n';
    }
    if (suggestions.watchlist?.length) {
        md += h3('Tier 3: Watchlist');
        suggestions.watchlist.forEach(s => {
            md += `- ${bold(s.name)} (${s.ticker}): ${s.reason}\n`;
        });
        md += '\n';
    }
    return md;
}

const industryChainToMarkdown = (chain: IndustryChain | string): string => {
    if (typeof chain === 'string') return chain + '\n\n';
    let md = '';
    if (chain.upstream?.length) {
        md += h3('Upstream');
        chain.upstream.forEach(n => md += `- ${bold(n.name)}: ${n.description}\n`);
        md += '\n';
    }
    if (chain.midstream?.length) {
        md += h3('Midstream');
        chain.midstream.forEach(n => md += `- ${bold(n.name)}: ${n.description}\n`);
        md += '\n';
    }
    if (chain.downstream?.length) {
        md += h3('Downstream');
        chain.downstream.forEach(n => md += `- ${bold(n.name)}: ${n.description}\n`);
        md += '\n';
    }
    return md;
}

export const analysisReportToMarkdown = (report: AnalysisReport, userInput: string): string => {
    let md = h1('Multi-dimensional Investment Analysis Report');
    md += `> Source: ${userInput}\n\n`;
    
    if(report.investmentScore) md += h2(`Investment Score: ${report.investmentScore.score}/100`);
    if(report.investmentScore) md += `${report.investmentScore.reason}\n\n`;

    if(report.informationGapScore) md += h2(`Information Gap Score: ${report.informationGapScore.score}/100`);
    if(report.informationGapScore) md += `${report.informationGapScore.reason}\n\n`;
    
    if(report.summary) md += h2('Overall Summary');
    if(report.summary) md += blockquote(report.summary);

    if(report.analysis?.marketSentiment) md += h2('Market Sentiment');
    if(report.analysis?.marketSentiment) md += `${bold('Sentiment:')} ${report.analysis.marketSentiment.sentiment}\n\n${report.analysis.marketSentiment.description}\n\n`;

    if(report.analysis?.industryChain) md += h2('Industry & Supply Chain');
    if(report.analysis?.industryChain) md += industryChainToMarkdown(report.analysis.industryChain);

    if (report.marketSizeAndOutlook) {
        md += h2('Market Size & Outlook');
        md += `${report.marketSizeAndOutlook.narrative}\n\n`;
        if (report.marketSizeAndOutlook.tamSamSom) {
            const { TAM, SAM, SOM, sourceOrMethodology } = report.marketSizeAndOutlook.tamSamSom;
            md += `- **TAM:** ${TAM}\n`;
            md += `- **SAM:** ${SAM}\n`;
            md += `- **SOM:** ${SOM}\n`;
            md += `*Source: ${sourceOrMethodology}*\n\n`;
        }
    }

    if (report.competitiveLandscape) {
        md += h2('Competitive Landscape');
        const headers = ['Player', 'Market Share', 'Tech Advantage', 'Revenue Growth', 'Gross Margin', 'Stock Performance'];
        const rows = report.competitiveLandscape.keyPlayers.map(p => [p.name, p.marketShare, p.techAdvantage, p.revenueGrowth, p.grossMargin, p.stockPerformance]);
        md += table(headers, rows);
        md += `**Summary:** ${report.competitiveLandscape.summary}\n\n`;
    }

    if (report.catalystTracker) {
        md += h2('Catalyst Tracker');
        if (report.catalystTracker.recentNews?.length) {
            md += h3('Recent News (Last 30 days)');
            report.catalystTracker.recentNews.forEach(n => md += `- **[${n.date}]** ${n.description} (Impact: ${n.impact})\n`);
            md += '\n';
        }
        if (report.catalystTracker.upcomingCatalysts?.length) {
            md += h3('Upcoming Catalysts (Next 1-3 months)');
            report.catalystTracker.upcomingCatalysts.forEach(c => md += `- **[${c.date}]** ${c.event}\n`);
            md += '\n';
        }
    }

    if (report.policyAnalysis) {
        md += h2('Regulatory & Policy Deep Dive');
        md += `**Assessment:** ${report.policyAnalysis.assessment}\n\n`;
        md += `**Current Policies:**\n${report.policyAnalysis.currentPolicies}\n\n`;
        md += `**Potential Changes:**\n${report.policyAnalysis.potentialChanges}\n\n`;
        md += `**Key Bodies:** ${report.policyAnalysis.keyBodies.join(', ')}\n\n`;
    }

    if (report.techTrajectory) {
        md += h2('Technology & Innovation Trajectory');
        md += `- **Maturity:** ${report.techTrajectory.maturity}\n`;
        md += `- **Core Technology:** ${report.techTrajectory.coreTech}\n`;
        md += `- **Moat Analysis:** ${report.techTrajectory.moatAnalysis}\n\n`;
        md += `**Innovation Trends:**\n${list(report.techTrajectory.innovationTrends)}`;
    }

    if (report.scenarioAnalysis?.length) {
        md += h2('Scenario Analysis');
        report.scenarioAnalysis.forEach(s => {
            md += h3(`${s.scenario} (${(s.probability * 100).toFixed(0)}% Probability)`);
            md += `${s.description}\n\n`;
            md += `**Key Drivers:**\n`;
            md += list(s.keyDrivers);
        });
    }
    
    if(report.investmentStrategy) {
        md += h2('Investment Strategy');
        md += h3('Core Logic');
        md += `${report.investmentStrategy.logic}\n\n`;
        md += h3('Suggestion');
        md += `${report.investmentStrategy.suggestion}\n\n`;

        if (report.investmentStrategy.timeHorizons) {
            md += h3('Time Horizons');
            md += `- **Short-Term (1-3 Mo):** ${report.investmentStrategy.timeHorizons.shortTerm}\n`;
            md += `- **Medium-Term (3-12 Mo):** ${report.investmentStrategy.timeHorizons.mediumTerm}\n`;
            md += `- **Long-Term (>1 Yr):** ${report.investmentStrategy.timeHorizons.longTerm}\n\n`;
        }
    }

    if(report.tieredSuggestions) md += h2('Tiered Suggestions');
    if(report.tieredSuggestions) md += tieredSuggestionsToMarkdown(report.tieredSuggestions);
    
    if(report.realTimeSources?.length) {
        md += h2('Real-time Search Sources');
        report.realTimeSources.forEach(s => {
            const date = s.publishedDate ? ` (${s.publishedDate.split('T')[0]})` : '';
            md += `- [${s.title}](${s.url})${date}\n`;
        });
        md += '\n';
    }

    if(report.sources?.length) {
        md += h2('Reference Sources');
        report.sources.forEach(s => md += `- [${s.title}](${s.uri})\n`);
        md += '\n';
    }

    return md;
}

export const stockAnalysisReportToMarkdown = (report: StockAnalysisReport): string => {
    let md = h1(`Stock Analysis Report: ${report.companyProfile.name}`);
    md += `${report.companyProfile.ticker} · ${report.companyProfile.sector} / ${report.companyProfile.industry}\n\n`;
    
    if(report.investmentScore) md += h2(`Investment Score: ${report.investmentScore.score}/100`);
    if(report.investmentScore) md += `${report.investmentScore.reason}\n\n`;

    if(report.marketSentimentAnalysis) {
        md += h2('Market Sentiment & Strategy Impact');
        md += `${bold('Sentiment:')} ${report.marketSentimentAnalysis.sentiment}\n\n`;
        md += `${bold('Description:')}\n${report.marketSentimentAnalysis.description}\n\n`;
        md += `${bold('Impact on Strategy:')}\n${report.marketSentimentAnalysis.strategyImpact}\n\n`;
    }

    if(report.financialTrends?.length) {
        md += h2('Financial Trends');
        const headers = ['Year', 'Revenue (Millions)', 'Net Income (Millions)'];
        const rows = report.financialTrends.map(ft => [ft.year, ft.revenue, ft.netIncome]);
        md += table(headers, rows);
    }

    if (report.valuationAnalysis) {
        md += h2('Valuation Analysis');
        md += `- **Judgment:** ${report.valuationAnalysis.judgment}\n`;
        md += `- **Target Price Range:** ${report.valuationAnalysis.targetPriceRange}\n`;
        md += `- **Reasoning:** ${report.valuationAnalysis.reasoning}\n`;
        md += `*Methodology: ${report.valuationAnalysis.methodology}*\n\n`;
    }

    if (report.peerComparison?.length) {
        md += h2('Peer Comparison');
        const headers = ['Company', 'Market Cap', 'P/E Ratio', 'Revenue Growth', 'Gross Margin'];
        const rows = report.peerComparison.map(p => [
            `${p.name} (${p.ticker})`,
            p.marketCap,
            p.peRatio,
            p.revenueGrowth,
            p.grossMargin
        ]);
        md += table(headers, rows);
    }

    if (report.researchReportConsensus) {
        const consensus = report.researchReportConsensus;
        md += h2('Institutional Insights');
        if (consensus.currentPrice) md += `**Current Price:** ${consensus.currentPrice}\n\n`;
        if (consensus.targetPriceSummary?.average) {
            md += h3('Consensus Target Price');
            md += `- **High:** ${consensus.targetPriceSummary.high ?? 'N/A'}\n`;
            md += `- **Average:** ${consensus.targetPriceSummary.average ?? 'N/A'}\n`;
            md += `- **Low:** ${consensus.targetPriceSummary.low ?? 'N/A'}\n\n`;
        }
        if (consensus.epsForecasts?.length) {
            md += h3('Consensus EPS Forecasts');
            const headers = ['Year', 'Consensus EPS', 'Growth Rate (%)'];
            const rows = consensus.epsForecasts.map(f => [f.year, f.consensusEps, f.growthRate]);
            md += table(headers, rows);
        }
        if (consensus.recentReports?.length) {
            md += h3('Recent Reports');
            consensus.recentReports.forEach(r => {
                md += `- [${r.title}](${r.pdfUrl}) - ${r.institution} (${r.publishDate}) - Rating: ${r.rating}\n`;
            });
            md += '\n';
        }
    }
    
    if (report.financialHealth) {
        md += h2('Deep-Dive Financial Health');
        const headers = ['Metric', 'Company Value', 'Industry Average'];
        const rows = [
            ['Solvency (Debt-to-Equity)', report.financialHealth.solvency.value, report.financialHealth.solvency.industryAverage],
            ['Efficiency (ROE)', report.financialHealth.efficiency.value, report.financialHealth.efficiency.industryAverage],
            ['Liquidity (Current Ratio)', report.financialHealth.liquidity.value, report.financialHealth.liquidity.industryAverage],
        ];
        md += table(headers, rows);
    }
    
    if (report.technicalAnalysis) {
        md += h2('Technical Analysis Snapshot');
        md += `> ${report.technicalAnalysis.summary}\n\n`;
        md += `- **14-Day RSI:** ${report.technicalAnalysis.rsi.value} (${report.technicalAnalysis.rsi.interpretation})\n`;
        md += `- **Price vs 50-Day MA:** ${report.technicalAnalysis.movingAverages['50-day']}\n`;
        md += `- **Price vs 200-Day MA:** ${report.technicalAnalysis.movingAverages['200-day']}\n\n`;
    }

    if(report.investmentThesis) {
        md += h2('Investment Thesis');
        md += h3('Bull Case');
        md += `${report.investmentThesis.bull}\n\n`;
        md += h3('Bear Case');
        md += `${report.investmentThesis.bear}\n\n`;
        md += h3('Conclusion');
        md += `${report.investmentThesis.conclusion}\n\n`;
    }
    
    if (report.managementAnalysis) {
        md += h2('Management & Insider Activity');
        md += h3('Key Executives');
        report.managementAnalysis.keyExecutives.forEach(exec => {
            md += `- **${exec.name} (${exec.title}):** ${exec.summary}\n`;
        });
        md += `\n${h3('Insider Trading Summary')}`;
        md += `${report.managementAnalysis.insiderTradingSummary}\n\n`;
    }
    
    if (report.earningsCallAnalysis) {
        md += h2('Earnings Call Intelligence');
        md += `- **Management Tone:** ${report.earningsCallAnalysis.managementTone}\n`;
        md += `- **Future Guidance:** ${report.earningsCallAnalysis.futureGuidance}\n\n`;
        md += h3('Key Q&A Highlights');
        report.earningsCallAnalysis.keyHighlights.forEach(hl => {
            md += `**Q: ${hl.question}**\n\n`;
            md += `A: ${hl.answer}\n\n`;
        });
    }

    if(report.swotAnalysis) {
        md += h2('SWOT Analysis');
        md += h3('Strengths');
        md += list(report.swotAnalysis.strengths);
        md += h3('Weaknesses');
        md += list(report.swotAnalysis.weaknesses);
        md += h3('Opportunities');
        md += list(report.swotAnalysis.opportunities);
        md += h3('Threats');
        md += list(report.swotAnalysis.threats);
    }
    
    return md;
}

export const positionalWarfareReportToMarkdown = (report: PositionalWarfareReport): string => {
    let md = h1('Positional Warfare Analysis Report');

    if(report.strategistSummary) md += h2('Strategist\'s Summary');
    if(report.strategistSummary) md += blockquote(report.strategistSummary);
    
    if(report.leaderStock) {
        const leader = report.leaderStock;
        md += h2(`Leader Stock: ${leader.name} (${leader.ticker})`);
        md += `- **Sector:** ${leader.sector}\n`;
        md += `- **Market:** ${leader.market}\n\n`;
        md += `**Leadership Analysis:**\n${leader.analysis}\n\n`;
        const headers = ['Market Cap', 'P/E Ratio', 'Revenue Growth', 'Recent Performance'];
        const rows = [[leader.metrics.marketCap, leader.metrics.peRatio, leader.metrics.revenueGrowth, leader.metrics.recentPerformance]];
        md += table(headers, rows);
    }

    if(report.followerCandidates?.length) {
        md += h2('Follower Candidates');
        report.followerCandidates.forEach((follower, index) => {
            md += h3(`Candidate #${index + 1}: ${follower.name} (${follower.ticker})`);
            md += `**Positioning Score:** ${follower.positioningScore.score}/10 - *${follower.positioningScore.reasoning}*\n\n`;
            md += `**Comparative Analysis:**\n${follower.comparativeAnalysis}\n\n`;
            md += `**Investment Thesis:**\n${follower.investmentThesis}\n\n`;
            md += `**Potential Catalysts:**\n${list(follower.potentialCatalysts)}`;
            md += `**Risks:**\n${list(follower.risks)}`;
        });
    }
    return md;
}
