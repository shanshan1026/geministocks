import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import type { EstimateAnalysisReport } from '../../types';
import { SectionCard, StatBox, VerdictBadge, fmtPrice, fmtPct, fmtNum, pctTone } from './shared';
import { ChartTrendingUpIcon, UsersIcon, CheckCircleIcon, LightBulbIcon } from '../icons/Icons';

const EstimateAnalysisResult: React.FC<{ report: EstimateAnalysisReport }> = ({ report }) => {
    const { t } = useI18n();
    const rev = report.revisionTrends;
    const growth = report.growthProjections;
    const acc = report.historicalAccuracy;
    const cov = report.analystCoverage;

    const momentumTone = rev?.momentum === 'positive' ? 'positive' : rev?.momentum === 'negative' ? 'negative' : 'caution';
    const totalRatings = cov ? (cov.buyRatings || 0) + (cov.holdRatings || 0) + (cov.sellRatings || 0) : 0;

    return (
        <div className="space-y-6">
            {/* Revision trends */}
            {rev && (
                <SectionCard title={t('skillResults.estimate.revisionTrends')} icon={<ChartTrendingUpIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="flex justify-end mb-4">
                        <VerdictBadge label={t(`skillResults.estimate.momentum.${rev.momentum || 'neutral'}`)} tone={momentumTone} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {([
                            ['last30Days', t('skillResults.estimate.last30')],
                            ['last90Days', t('skillResults.estimate.last90')],
                        ] as const).map(([key, label]) => {
                            const d = rev[key];
                            if (!d) return null;
                            return (
                                <div key={key} className="rounded-lg border border-stone-200 p-4">
                                    <div className="text-xs font-medium text-gray-500 mb-2">{label}</div>
                                    <div className="flex items-center gap-x-4 text-sm">
                                        <span className="text-green-600 font-semibold">↑ {d.up ?? 0}</span>
                                        <span className="text-red-600 font-semibold">↓ {d.down ?? 0}</span>
                                        <span className={`font-bold ${d.net > 0 ? 'text-green-700' : d.net < 0 ? 'text-red-700' : 'text-gray-700'}`}>
                                            {t('skillResults.estimate.net')}: {d.net > 0 ? '+' : ''}{d.net ?? 0}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionCard>
            )}

            {/* Growth projections */}
            {growth && (
                <SectionCard title={t('skillResults.estimate.growthProjections')} icon={<ChartTrendingUpIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatBox
                            label={t('skillResults.estimate.currentYear')}
                            value={`$${fmtNum(growth.currentYear?.eps, 2)}`}
                            sub={`${t('skillResults.estimate.growth')}: ${fmtPct(growth.currentYear?.growth, true)}`}
                            tone={pctTone(growth.currentYear?.growth)}
                        />
                        <StatBox
                            label={t('skillResults.estimate.nextYear')}
                            value={`$${fmtNum(growth.nextYear?.eps, 2)}`}
                            sub={`${t('skillResults.estimate.growth')}: ${fmtPct(growth.nextYear?.growth, true)}`}
                            tone={pctTone(growth.nextYear?.growth)}
                        />
                        <StatBox label={t('skillResults.estimate.longTerm')} value={fmtPct(growth.longTermGrowth, true)} />
                    </div>
                </SectionCard>
            )}

            {/* Historical accuracy */}
            {acc && (
                <SectionCard title={t('skillResults.estimate.historicalAccuracy')} icon={<CheckCircleIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatBox label={t('skillResults.estimate.avgSurprise')} value={fmtPct(acc.avgBeatMiss, true)} tone={pctTone(acc.avgBeatMiss)} />
                        <StatBox label={t('skillResults.estimate.consistency')} value={t(`skillResults.estimate.consistencyLevels.${acc.consistency || 'medium'}`)} />
                        <StatBox label={t('skillResults.estimate.direction')} value={t(`skillResults.estimate.directions.${acc.direction || 'mixed'}`)} />
                    </div>
                </SectionCard>
            )}

            {/* Analyst coverage */}
            {cov && (
                <SectionCard title={t('skillResults.estimate.coverage')} icon={<UsersIcon className="w-5 h-5 text-gray-700" />}>
                    {totalRatings > 0 && (
                        <div className="mb-5">
                            <div className="flex h-3 rounded-full overflow-hidden border border-stone-200" role="img" aria-label={t('skillResults.estimate.ratingsDistribution')}>
                                <div className="bg-green-500" style={{ width: `${((cov.buyRatings || 0) / totalRatings) * 100}%` }} />
                                <div className="bg-amber-400" style={{ width: `${((cov.holdRatings || 0) / totalRatings) * 100}%` }} />
                                <div className="bg-red-500" style={{ width: `${((cov.sellRatings || 0) / totalRatings) * 100}%` }} />
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
                                <span><span className="font-semibold text-green-700">{cov.buyRatings ?? 0}</span> {t('skillResults.estimate.buy')}</span>
                                <span><span className="font-semibold text-amber-700">{cov.holdRatings ?? 0}</span> {t('skillResults.estimate.hold')}</span>
                                <span><span className="font-semibold text-red-700">{cov.sellRatings ?? 0}</span> {t('skillResults.estimate.sell')}</span>
                                <span>{t('skillResults.estimate.totalAnalysts', { count: cov.totalAnalysts ?? totalRatings })}</span>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <StatBox label={t('skillResults.currentPrice')} value={fmtPrice(cov.currentPrice)} />
                        <StatBox label={t('skillResults.estimate.avgTarget')} value={fmtPrice(cov.avgTargetPrice)} tone="accent" />
                        <StatBox label={t('skillResults.estimate.highTarget')} value={fmtPrice(cov.highTarget)} tone="positive" />
                        <StatBox label={t('skillResults.estimate.lowTarget')} value={fmtPrice(cov.lowTarget)} tone="negative" />
                    </div>
                </SectionCard>
            )}

            {/* Interpretation */}
            {report.interpretation && (
                <SectionCard title={t('skillResults.estimate.interpretation')} icon={<LightBulbIcon className="w-5 h-5 text-amber-500" />}>
                    <p className="text-sm text-gray-700 leading-relaxed">{report.interpretation}</p>
                </SectionCard>
            )}
        </div>
    );
};

export default EstimateAnalysisResult;
