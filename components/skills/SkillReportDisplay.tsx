import React from 'react';
import type { SkillReport } from '../../types';
import DCFValuationResult from './DCFValuationResult';
import EarningsPreviewResult from './EarningsPreviewResult';
import EarningsRecapResult from './EarningsRecapResult';
import SEPAStrategyResult from './SEPAStrategyResult';
import StartupAnalysisResult from './StartupAnalysisResult';
import EstimateAnalysisResult from './EstimateAnalysisResult';

const SkillReportDisplay: React.FC<{ report: SkillReport }> = ({ report }) => {
    switch (report.skillType) {
        case 'dcf-valuation':
            return <DCFValuationResult report={report} />;
        case 'earnings-preview':
            return <EarningsPreviewResult report={report} />;
        case 'earnings-recap':
            return <EarningsRecapResult report={report} />;
        case 'sepa-strategy':
            return <SEPAStrategyResult report={report} />;
        case 'startup-analysis':
            return <StartupAnalysisResult report={report} />;
        case 'estimate-analysis':
            return <EstimateAnalysisResult report={report} />;
        default:
            return null;
    }
};

export default SkillReportDisplay;
