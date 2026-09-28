import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import type { DCFValuationReport } from '../../types';
import { SectionCard, StatBox, BulletList, fmtPrice, fmtPct, fmtNum, fmtMillions, pctTone } from './shared';
import { ScaleIcon, ChartBarIcon, ExclamationTriangleIcon, UsersIcon } from '../icons/Icons';

const DCFValuationResult: React.FC<{ report: DCFValuationReport }> = ({ report }) => {
    const { t } = useI18n();
    const a = report.dcfDetails?.assumptions;

    return (
        <div className="space-y-6">
            {/* Headline numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatBox label={t('skillResults.currentPrice')} value={fmtPrice(report.currentPrice)} />
                <StatBox label={t('skillResults.dcf.blendedPrice')} value={fmtPrice(report.blendedImpliedPrice)} tone="accent" />
                <StatBox
                    label={t('skillResults.dcf.upside')}
                    value={fmtPct(report.upsideDownside, true)}
                    tone={pctTone(report.upsideDownside)}
                />
            </div>

            {/* Triangulation */}
            <SectionCard title={t('skillResults.dcf.triangulation')} icon={<ScaleIcon className="w-5 h-5 text-gray-700" />}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatBox label="DCF" value={fmtPrice(report.dcfImpliedPrice)} />
                    <StatBox label={t('skillResults.dcf.relative')} value={fmtPrice(report.relativeImpliedPrice)} />
                    <StatBox label="SOTP" value={report.sotpImpliedPrice ? fmtPrice(report.sotpImpliedPrice) : t('skillResults.dcf.notApplicable')} />
                </div>
                {a && (
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
                        <span className="px-2.5 py-1 bg-stone-100 rounded-full">WACC {fmtNum(a.wacc)}%</span>
                        <span className="px-2.5 py-1 bg-stone-100 rounded-full">g {fmtNum(a.terminalGrowth)}%</span>
                        <span className="px-2.5 py-1 bg-stone-100 rounded-full">Beta {fmtNum(a.beta, 2)}</span>
                        <span className="px-2.5 py-1 bg-stone-100 rounded-full">{t('skillResults.dcf.riskFree')} {fmtNum(a.riskFreeRate)}%</span>
                        <span className="px-2.5 py-1 bg-stone-100 rounded-full">{t('skillResults.dcf.years', { count: a.projectionYears })}</span>
                    </div>
                )}
            </SectionCard>

            {/* FCFF projection */}
            {report.dcfDetails?.fcffProjection?.length > 0 && (
                <SectionCard title={t('skillResults.dcf.fcffProjection')} icon={<ChartBarIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-stone-200 text-gray-500">
                                    <th className="text-left py-2 font-medium">{t('skillResults.dcf.year')}</th>
                                    <th className="text-right py-2 font-medium">{t('skillResults.dcf.revenue')}</th>
                                    <th className="text-right py-2 font-medium">EBIT</th>
                                    <th className="text-right py-2 font-medium">FCFF</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.dcfDetails.fcffProjection.map((row, i) => (
                                    <tr key={i} className="border-b border-stone-100">
                                        <td className="py-2 font-medium text-gray-900">{row.year}</td>
                                        <td className="text-right py-2 text-gray-700">{fmtMillions(row.revenue)}</td>
                                        <td className="text-right py-2 text-gray-700">{fmtMillions(row.ebit)}</td>
                                        <td className="text-right py-2 text-gray-700">{fmtMillions(row.fcff)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex justify-between sm:block">
                            <span className="text-gray-500">{t('skillResults.dcf.terminalValue')}</span>
                            <div className="font-semibold text-gray-900">{fmtMillions(report.dcfDetails.terminalValue)}</div>
                        </div>
                        <div className="flex justify-between sm:block">
                            <span className="text-gray-500">{t('skillResults.dcf.enterpriseValue')}</span>
                            <div className="font-semibold text-gray-900">{fmtMillions(report.dcfDetails.presentValue)}</div>
                        </div>
                        <div className="flex justify-between sm:block">
                            <span className="text-gray-500">{t('skillResults.dcf.equityValue')}</span>
                            <div className="font-semibold text-gray-900">{fmtMillions(report.dcfDetails.equityValue)}</div>
                        </div>
                    </div>
                </SectionCard>
            )}

            {/* Sensitivity matrix */}
            {report.sensitivityMatrix?.priceMatrix?.length > 0 && (
                <SectionCard title={t('skillResults.dcf.sensitivity')} icon={<ChartBarIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="overflow-x-auto">
                        <table className="text-xs sm:text-sm border-collapse">
                            <thead>
                                <tr>
                                    <th className="border border-stone-200 bg-stone-100 p-2 text-gray-600 font-medium">{'WACC \\ g'}</th>
                                    {report.sensitivityMatrix.gRange.map((g, i) => (
                                        <th key={i} className="border border-stone-200 bg-stone-100 p-2 text-gray-600 font-medium">
                                            {fmtNum(g)}%
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {report.sensitivityMatrix.waccRange.map((wacc, i) => (
                                    <tr key={i}>
                                        <td className="border border-stone-200 bg-stone-100 p-2 font-semibold text-gray-700">{fmtNum(wacc)}%</td>
                                        {(report.sensitivityMatrix.priceMatrix[i] || []).map((price, j) => {
                                            const isBase =
                                                a &&
                                                Math.abs(wacc - a.wacc) < 0.26 &&
                                                Math.abs(report.sensitivityMatrix.gRange[j] - a.terminalGrowth) < 0.26;
                                            return (
                                                <td
                                                    key={j}
                                                    className={`border border-stone-200 p-2 text-right ${isBase ? 'bg-amber-50 font-bold text-gray-900' : 'text-gray-700'}`}
                                                >
                                                    {fmtPrice(price)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            )}

            {/* Scenarios */}
            {report.scenarios && (
                <SectionCard title={t('skillResults.dcf.scenarios')} icon={<ScaleIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {([
                            ['bull', 'border-green-200 bg-green-50/50', 'text-green-700'],
                            ['base', 'border-stone-300 bg-stone-50', 'text-gray-900'],
                            ['bear', 'border-red-200 bg-red-50/50', 'text-red-700'],
                        ] as const).map(([key, boxCls, priceCls]) => (
                            <div key={key} className={`rounded-lg border-2 p-4 ${boxCls}`}>
                                <div className="text-sm font-medium text-gray-600 mb-1">{t(`skillResults.dcf.${key}Case`)}</div>
                                <div className={`text-xl font-bold ${priceCls}`}>{fmtPrice(report.scenarios[key]?.price)}</div>
                                <p className="text-xs text-gray-600 mt-2 leading-relaxed">{report.scenarios[key]?.assumptions}</p>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* Peer comparison */}
            {report.relativeValuation?.peers?.length > 0 && (
                <SectionCard title={t('skillResults.dcf.peerComparison')} icon={<UsersIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-stone-200 text-gray-500">
                                    <th className="text-left py-2 font-medium">{t('skillResults.company')}</th>
                                    <th className="text-right py-2 font-medium">P/E</th>
                                    <th className="text-right py-2 font-medium">EV/Rev</th>
                                    <th className="text-right py-2 font-medium">EV/EBITDA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.relativeValuation.peers.map((peer, i) => (
                                    <tr key={i} className="border-b border-stone-100">
                                        <td className="py-2 text-gray-900">
                                            {peer.name} <span className="text-gray-500">({peer.ticker})</span>
                                        </td>
                                        <td className="text-right py-2 text-gray-700">{fmtNum(peer.pe)}x</td>
                                        <td className="text-right py-2 text-gray-700">{fmtNum(peer.evRevenue)}x</td>
                                        <td className="text-right py-2 text-gray-700">{fmtNum(peer.evEbitda)}x</td>
                                    </tr>
                                ))}
                                <tr className="bg-stone-50 font-semibold text-gray-900">
                                    <td className="py-2">{t('skillResults.median')}</td>
                                    <td className="text-right py-2">{fmtNum(report.relativeValuation.medianPE)}x</td>
                                    <td className="text-right py-2">{fmtNum(report.relativeValuation.medianEVRevenue)}x</td>
                                    <td className="text-right py-2">{fmtNum(report.relativeValuation.medianEVEBITDA)}x</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            )}

            {/* Key risks */}
            {report.keyRisks?.length > 0 && (
                <SectionCard title={t('skillResults.keyRisks')} icon={<ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />}>
                    <BulletList items={report.keyRisks} />
                </SectionCard>
            )}
        </div>
    );
};

export default DCFValuationResult;
