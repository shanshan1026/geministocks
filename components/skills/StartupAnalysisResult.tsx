import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import type { StartupAnalysisReport } from '../../types';
import { SectionCard, StatBox, BulletList, VerdictBadge } from './shared';
import { BanknotesIcon, UserIcon, LightBulbIcon } from '../icons/Icons';

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">{label}</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{value}</p>
    </div>
);

const StartupAnalysisResult: React.FC<{ report: StartupAnalysisReport }> = ({ report }) => {
    const { t } = useI18n();
    const vc = report.vcInvestorPerspective;
    const job = report.jobApplicantPerspective;
    const founder = report.founderPerspective;

    const vcTone = vc?.verdict === 'invest' ? 'positive' : vc?.verdict === 'maybe' ? 'caution' : 'negative';
    const jobTone = job?.verdict === 'strong-fit' ? 'positive' : job?.verdict === 'consider' ? 'caution' : 'negative';

    return (
        <div className="space-y-6">
            {/* Overview */}
            {report.companyOverview && (
                <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 sm:p-6">
                    <p className="text-sm text-gray-700 leading-relaxed">{report.companyOverview}</p>
                </div>
            )}

            {/* VC Investor perspective */}
            {vc && (
                <SectionCard title={t('skillResults.startup.vcPerspective')} icon={<BanknotesIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="flex justify-end mb-4">
                        <VerdictBadge label={t(`skillResults.startup.vcVerdicts.${vc.verdict || 'pass'}`)} tone={vcTone} />
                    </div>
                    {vc.marketSize && (
                        <div className="grid grid-cols-3 gap-4 mb-5">
                            <StatBox label="TAM" value={vc.marketSize.tam || 'N/A'} />
                            <StatBox label="SAM" value={vc.marketSize.sam || 'N/A'} />
                            <StatBox label="SOM" value={vc.marketSize.som || 'N/A'} />
                        </div>
                    )}
                    <div className="space-y-4">
                        <Field label={t('skillResults.startup.pmf')} value={vc.productMarketFit} />
                        <Field label={t('skillResults.startup.team')} value={vc.teamQuality} />
                        <Field label={t('skillResults.startup.traction')} value={vc.traction} />
                        <Field label={t('skillResults.startup.moat')} value={vc.competitiveAdvantage} />
                        <Field label={t('skillResults.startup.thesis')} value={vc.investmentThesis} />
                        {vc.risks?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('skillResults.keyRisks')}</h4>
                                <BulletList items={vc.risks} />
                            </div>
                        )}
                    </div>
                </SectionCard>
            )}

            {/* Job applicant perspective */}
            {job && (
                <SectionCard title={t('skillResults.startup.jobPerspective')} icon={<UserIcon className="w-5 h-5 text-gray-700" />}>
                    <div className="flex justify-end mb-4">
                        <VerdictBadge label={t(`skillResults.startup.jobVerdicts.${job.verdict || 'consider'}`)} tone={jobTone} />
                    </div>
                    <div className="space-y-4">
                        <Field label={t('skillResults.startup.stage')} value={job.companyStage} />
                        <Field label={t('skillResults.startup.growth')} value={job.growthTrajectory} />
                        <Field label={t('skillResults.startup.compensation')} value={job.compensationStructure} />
                        <Field label={t('skillResults.startup.careerRisk')} value={job.careerRisk} />
                        {job.learningOpportunities?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('skillResults.startup.learning')}</h4>
                                <BulletList items={job.learningOpportunities} />
                            </div>
                        )}
                    </div>
                </SectionCard>
            )}

            {/* Founder perspective */}
            {founder && (
                <SectionCard title={t('skillResults.startup.founderPerspective')} icon={<LightBulbIcon className="w-5 h-5 text-amber-500" />}>
                    <div className="space-y-4">
                        <Field label={t('skillResults.startup.landscape')} value={founder.competitiveLandscape} />
                        <Field label={t('skillResults.startup.gtm')} value={founder.goToMarketStrategy} />
                        <Field label={t('skillResults.startup.funding')} value={founder.fundingStrategy} />
                        {founder.keyMilestones?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('skillResults.startup.milestones')}</h4>
                                <BulletList items={founder.keyMilestones} />
                            </div>
                        )}
                        {founder.exitScenarios?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('skillResults.startup.exits')}</h4>
                                <BulletList items={founder.exitScenarios} />
                            </div>
                        )}
                    </div>
                </SectionCard>
            )}
        </div>
    );
};

export default StartupAnalysisResult;
