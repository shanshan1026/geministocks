import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import type { EarningsRecapReport } from '../../types';
import { SectionCard, StatBox, BulletList, VerdictBadge, fmtPct, fmtNum, pctTone } from './shared';
import { ChartBarIcon, PresentationChartLineIcon, MicrophoneIcon, UsersIcon } from '../icons/Icons';

const EarningsRecapResult: React.FC<{ report: EarningsRecapReport }> = ({ report }) => {
    const { t } = useI18n();
    const r = report.results;
    const pr = report.priceReaction;
    const m = report.marginTrends;

    const guidanceTone =
        report.guidance?.vsConsensus === 'above' ? 'positive' : report.guidance?.vsConsensus === 'below' ? 'negative' : 'neutral';

    return (
        <div className="space-y-6">
            {/* Results headline */}
            {r && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatBox
                        label={`EPS (${t('skillResults.recap.actualVsEst')})`}
                        value={`$${fmtNum(r.actualEPS, 2)} / $${fmtNum(r.estimatedEPS, 2)}`}
                        sub={`${t('skillResults.preview.surprise')}: ${fmtPct(r.epsSurprise, true)}`}
                        tone={pctTone(r.epsSurprise)}
                    />
                    <StatBox
                        label={`${t('skillResults.dcf.revenue')} (${t('skillResults.recap.actualVsEst')})`}
                        value={`${r.actualRevenue || 'N/A'} / ${r.estimatedRevenue || 'N/A'}`}
                        sub={`${t('skillResults.preview.surprise')}: ${fmtPct(r.revenueSurprise, true)}`}
                        tone={pctTone(r.revenueSurprise)}
                    />
                    <StatBox label={t('skillResults.quarter')} value={report.quarter || 'N/A'} tone="accent" />
                </div>
            )}

            {/* Price reaction */}
            {pr && (
                <SectionCard title={t('skillResults.recap.priceReaction')} icon={<ChartBarIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatBox label={t('skillResults.recap.oneDay')} value={fmtPct(pr.oneDayChange, true)} tone={pctTone(pr.oneDayChange)} />
                        <StatBox label={t('skillResults.recap.fiveDay')} value={fmtPct(pr.fiveDayChange, true)} tone={pctTone(pr.fiveDayChange)} />
                        <StatBox label={t('skillResults.recap.volumeRatio')} value={`${fmtNum(pr.volumeRatio)}x`} />
                    </div>
                </SectionCard>
            )}

            {/* Margin trends */}
            {m && (
                <SectionCard title={t('skillResults.recap.marginTrends')} icon={<PresentationChartLineIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-stone-200 text-gray-500">
                                    <th className="text-left py-2 font-medium">{t('skillResults.recap.margin')}</th>
                                    <th className="text-right py-2 font-medium">{t('skillResults.recap.current')}</th>
                                    <th className="text-right py-2 font-medium">{t('skillResults.recap.prior')}</th>
                                    <th className="text-right py-2 font-medium">{t('skillResults.recap.yoyChange')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {([
                                    ['grossMargin', t('skillResults.recap.grossMargin')],
                                    ['operatingMargin', t('skillResults.recap.operatingMargin')],
                                    ['netMargin', t('skillResults.recap.netMargin')],
                                ] as const).map(([key, label]) => {
                                    const row = m[key];
                                    if (!row) return null;
                                    return (
                                        <tr key={key} className="border-b border-stone-100">
                                            <td className="py-2 font-medium text-gray-900">{label}</td>
                                            <td className="text-right py-2 text-gray-700">{fmtPct(row.current)}</td>
                                            <td className="text-right py-2 text-gray-700">{fmtPct(row.prior)}</td>
                                            <td className={`text-right py-2 font-medium ${row.yoyChange > 0 ? 'text-green-600' : row.yoyChange < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                                                {fmtPct(row.yoyChange, true)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            )}

            {/* Guidance */}
            {report.guidance && (
                <SectionCard title={t('skillResults.recap.guidance')} icon={<PresentationChartLineIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <VerdictBadge
                            label={t(`skillResults.recap.vsConsensus.${report.guidance.vsConsensus || 'n/a'}`)}
                            tone={guidanceTone as 'positive' | 'negative' | 'neutral'}
                        />
                        <p className="text-sm text-gray-700 leading-relaxed flex-1">{report.guidance.summary}</p>
                    </div>
                </SectionCard>
            )}

            {/* Management commentary */}
            {report.managementCommentary?.length > 0 && (
                <SectionCard title={t('skillResults.recap.managementCommentary')} icon={<MicrophoneIcon className="w-5 h-5 text-gray-700" />}>
                    <BulletList items={report.managementCommentary} />
                </SectionCard>
            )}

            {/* Analyst reactions */}
            {report.analystReactions?.length > 0 && (
                <SectionCard title={t('skillResults.recap.analystReactions')} icon={<UsersIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-stone-200 text-gray-500">
                                    <th className="text-left py-2 font-medium">{t('skillResults.recap.firm')}</th>
                                    <th className="text-left py-2 font-medium">{t('skillResults.recap.action')}</th>
                                    <th className="text-left py-2 font-medium">{t('skillResults.recap.rating')}</th>
                                    <th className="text-right py-2 font-medium">{t('skillResults.recap.target')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.analystReactions.map((row, i) => (
                                    <tr key={i} className="border-b border-stone-100">
                                        <td className="py-2 font-medium text-gray-900">{row.firm}</td>
                                        <td className={`py-2 font-medium ${row.action === 'upgrade' ? 'text-green-600' : row.action === 'downgrade' ? 'text-red-600' : 'text-gray-700'}`}>
                                            {t(`skillResults.recap.actions.${row.action || 'reiterate'}`)}
                                        </td>
                                        <td className="py-2 text-gray-700">{row.newRating}</td>
                                        <td className="text-right py-2 text-gray-700">${fmtNum(row.newTarget, 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            )}
        </div>
    );
};

export default EarningsRecapResult;
