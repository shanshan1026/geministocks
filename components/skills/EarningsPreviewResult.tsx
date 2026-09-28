import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import type { EarningsPreviewReport } from '../../types';
import { SectionCard, StatBox, BulletList, VerdictBadge, fmtPct, fmtNum, pctTone } from './shared';
import { ChartBarIcon, UsersIcon, LightBulbIcon } from '../icons/Icons';

const EarningsPreviewResult: React.FC<{ report: EarningsPreviewReport }> = ({ report }) => {
    const { t } = useI18n();
    const sentiment = report.analystSentiment;
    const sentimentTone = sentiment?.netSentiment === 'bullish' ? 'positive' : sentiment?.netSentiment === 'bearish' ? 'negative' : 'caution';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatBox label={t('skillResults.preview.earningsDate')} value={report.earningsDate || 'N/A'} tone="accent" />
                <StatBox label={t('skillResults.preview.epsEstimate')} value={`$${fmtNum(report.consensusEstimates?.epsEstimate, 2)}`} />
                <StatBox label={t('skillResults.preview.revenueEstimate')} value={report.consensusEstimates?.revenueEstimate || 'N/A'} />
            </div>

            {/* Beat/miss history */}
            {report.beatMissHistory?.length > 0 && (
                <SectionCard title={t('skillResults.preview.beatMissHistory')} icon={<ChartBarIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-stone-200 text-gray-500">
                                    <th className="text-left py-2 font-medium">{t('skillResults.quarter')}</th>
                                    <th className="text-right py-2 font-medium">{t('skillResults.preview.actualEPS')}</th>
                                    <th className="text-right py-2 font-medium">{t('skillResults.preview.estEPS')}</th>
                                    <th className="text-right py-2 font-medium">{t('skillResults.preview.surprise')}</th>
                                    <th className="text-right py-2 font-medium">{t('skillResults.preview.priceReaction')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.beatMissHistory.map((row, i) => (
                                    <tr key={i} className="border-b border-stone-100">
                                        <td className="py-2 font-medium text-gray-900">{row.quarter}</td>
                                        <td className="text-right py-2 text-gray-700">${fmtNum(row.actualEPS, 2)}</td>
                                        <td className="text-right py-2 text-gray-700">${fmtNum(row.estimatedEPS, 2)}</td>
                                        <td className={`text-right py-2 font-medium ${row.surprise > 0 ? 'text-green-600' : row.surprise < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                                            {fmtPct(row.surprise, true)}
                                        </td>
                                        <td className={`text-right py-2 font-medium ${row.priceReaction > 0 ? 'text-green-600' : row.priceReaction < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                                            {fmtPct(row.priceReaction, true)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            )}

            {/* Analyst sentiment */}
            {sentiment && (
                <SectionCard title={t('skillResults.preview.analystSentiment')} icon={<UsersIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="grid grid-cols-3 gap-4 flex-1 min-w-[240px]">
                            <StatBox label={t('skillResults.preview.upgrades')} value={String(sentiment.upgrades ?? 0)} tone={pctTone(sentiment.upgrades)} />
                            <StatBox label={t('skillResults.preview.downgrades')} value={String(sentiment.downgrades ?? 0)} tone={sentiment.downgrades > 0 ? 'negative' : 'neutral'} />
                            <StatBox label={t('skillResults.preview.reiterations')} value={String(sentiment.reiterations ?? 0)} />
                        </div>
                        <VerdictBadge label={t(`skillResults.preview.sentiment.${sentiment.netSentiment || 'neutral'}`)} tone={sentimentTone} />
                    </div>
                </SectionCard>
            )}

            {/* Key metrics and catalysts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.keyMetricsToWatch?.length > 0 && (
                    <SectionCard title={t('skillResults.preview.keyMetrics')} icon={<ChartBarIcon className="w-5 h-5 text-gray-700" />}>
                        <BulletList items={report.keyMetricsToWatch} />
                    </SectionCard>
                )}
                {report.catalysts?.length > 0 && (
                    <SectionCard title={t('skillResults.preview.catalysts')} icon={<LightBulbIcon className="w-5 h-5 text-amber-500" />}>
                        <BulletList items={report.catalysts} />
                    </SectionCard>
                )}
            </div>
        </div>
    );
};

export default EarningsPreviewResult;
