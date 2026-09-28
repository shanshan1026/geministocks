import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import type { SEPAStrategyReport } from '../../types';
import { SectionCard, StatBox, VerdictBadge, PassFailDot, fmtPrice, fmtPct, fmtNum, pctTone } from './shared';
import { ChartTrendingUpIcon, CheckCircleIcon, ChartBarIcon, BanknotesIcon } from '../icons/Icons';

const SEPAStrategyResult: React.FC<{ report: SEPAStrategyReport }> = ({ report }) => {
    const { t } = useI18n();

    const verdictTone =
        report.overallVerdict === 'strong-buy-setup' ? 'positive' : report.overallVerdict === 'watch-list' ? 'caution' : 'negative';
    const envTone = report.marketEnvironment === 'bull' ? 'positive' : report.marketEnvironment === 'bear' ? 'negative' : 'caution';
    const gradeTone =
        report.fundamentalGrade === 'A' || report.fundamentalGrade === 'B' ? 'positive' : report.fundamentalGrade === 'C' ? 'caution' : 'negative';

    return (
        <div className="space-y-6">
            {/* Verdict header */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                    <VerdictBadge label={t(`skillResults.sepa.verdicts.${report.overallVerdict || 'pass'}`)} tone={verdictTone} />
                    <VerdictBadge label={`${t('skillResults.sepa.stage')} ${report.stageAnalysis?.currentStage ?? '?'}`} tone="neutral" />
                    <VerdictBadge label={`${t('skillResults.sepa.fundamentals')} ${report.fundamentalGrade || '?'}`} tone={gradeTone} />
                    <VerdictBadge label={t(`skillResults.sepa.env.${report.marketEnvironment || 'choppy'}`)} tone={envTone} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{report.verdictReasoning}</p>
                {report.stageAnalysis?.stageDescription && (
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        {report.stageAnalysis.stageDescription}
                        {typeof report.stageAnalysis.baseCount === 'number' &&
                            ` · ${t('skillResults.sepa.baseCount', { count: report.stageAnalysis.baseCount })}`}
                    </p>
                )}
            </div>

            {/* Trend template checklist */}
            {report.trendTemplate?.conditions?.length > 0 && (
                <SectionCard title={t('skillResults.sepa.trendTemplate')} icon={<CheckCircleIcon className="w-5 h-5 text-gray-700" />}>
                    <ul className="space-y-2.5">
                        {report.trendTemplate.conditions.map((cond, i) => (
                            <li key={i} className="flex items-center gap-x-3 text-sm">
                                <PassFailDot pass={cond.pass} />
                                <span className={`flex-1 ${cond.pass ? 'text-gray-700' : 'text-red-700 font-medium'}`}>{cond.name}</span>
                                <span className="text-gray-500 text-xs">{cond.value}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 pt-3 border-t border-stone-100 text-sm font-semibold flex items-center gap-x-2">
                        <PassFailDot pass={report.trendTemplate.allPass} />
                        <span className={report.trendTemplate.allPass ? 'text-green-700' : 'text-red-700'}>
                            {report.trendTemplate.allPass ? t('skillResults.sepa.allPass') : t('skillResults.sepa.notAllPass')}
                        </span>
                    </div>
                </SectionCard>
            )}

            {/* Fundamentals */}
            {report.fundamentalDetails && (
                <SectionCard title={t('skillResults.sepa.fundamentalDetails')} icon={<ChartBarIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <StatBox
                            label={t('skillResults.sepa.epsGrowth')}
                            value={fmtPct(report.fundamentalDetails.epsGrowth, true)}
                            tone={pctTone(report.fundamentalDetails.epsGrowth)}
                        />
                        <StatBox
                            label={t('skillResults.sepa.revenueGrowth')}
                            value={fmtPct(report.fundamentalDetails.revenueGrowth, true)}
                            tone={pctTone(report.fundamentalDetails.revenueGrowth)}
                        />
                        <StatBox
                            label={t('skillResults.sepa.epsAcceleration')}
                            value={report.fundamentalDetails.epsAcceleration ? t('skillResults.yes') : t('skillResults.no')}
                            tone={report.fundamentalDetails.epsAcceleration ? 'positive' : 'neutral'}
                        />
                        <StatBox
                            label={t('skillResults.sepa.marginTrend')}
                            value={t(`skillResults.sepa.margins.${report.fundamentalDetails.marginTrend || 'stable'}`)}
                            tone={
                                report.fundamentalDetails.marginTrend === 'expanding'
                                    ? 'positive'
                                    : report.fundamentalDetails.marginTrend === 'contracting'
                                      ? 'negative'
                                      : 'neutral'
                            }
                        />
                    </div>
                    {report.fundamentalDetails.catalyst && (
                        <p className="text-sm text-gray-700 mt-4 leading-relaxed">
                            <span className="font-semibold">{t('skillResults.sepa.catalyst')}: </span>
                            {report.fundamentalDetails.catalyst}
                        </p>
                    )}
                </SectionCard>
            )}

            {/* Pattern */}
            {report.patternIdentified && (
                <SectionCard title={t('skillResults.sepa.pattern')} icon={<ChartTrendingUpIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <VerdictBadge
                            label={t(`skillResults.sepa.patterns.${report.patternIdentified.type || 'none'}`)}
                            tone={report.patternIdentified.type === 'none' ? 'neutral' : 'positive'}
                        />
                        <p className="text-sm text-gray-700 leading-relaxed flex-1">{report.patternIdentified.description}</p>
                    </div>
                </SectionCard>
            )}

            {/* Entry plan */}
            {report.entryPlan && (
                <SectionCard title={t('skillResults.sepa.entryPlan')} icon={<BanknotesIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <StatBox label={t('skillResults.sepa.pivot')} value={fmtPrice(report.entryPlan.pivotPrice)} tone="accent" />
                        <StatBox
                            label={t('skillResults.sepa.buyZone')}
                            value={`${fmtPrice(report.entryPlan.buyZoneLow)} - ${fmtPrice(report.entryPlan.buyZoneHigh)}`}
                        />
                        <StatBox label={t('skillResults.sepa.stopLoss')} value={fmtPrice(report.entryPlan.stopLoss)} tone="negative" />
                        <StatBox label={t('skillResults.sepa.firstTarget')} value={fmtPrice(report.entryPlan.firstTarget)} tone="positive" />
                        <StatBox label={t('skillResults.sepa.rewardRisk')} value={`${fmtNum(report.entryPlan.rewardRiskRatio)} : 1`} />
                    </div>
                </SectionCard>
            )}
        </div>
    );
};

export default SEPAStrategyResult;
