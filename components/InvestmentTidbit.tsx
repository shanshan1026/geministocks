import React from 'react';
import { LightBulbIcon } from './icons/Icons';
import { useI18n } from '../hooks/useI18n';

interface InvestmentTidbitProps {
  tidbit: string | null;
  isLoading: boolean;
  error: string | null;
}

const InvestmentTidbit: React.FC<InvestmentTidbitProps> = ({ tidbit, isLoading, error }) => {
  const { t } = useI18n();

  const Skeleton = () => (
    <div className="animate-pulse flex space-x-4">
      <div className="flex-1 space-y-3 py-1">
        <div className="h-4 bg-slate-200/80 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200/80 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm animate-reveal-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-black rounded-xl shadow-lg flex items-center justify-center">
          <LightBulbIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-black">{t('investmentTidbit.title')}</h3>
        </div>
      </div>
      
      <div className="pl-4 border-l-4 border-gray-300 ml-4">
        {isLoading ? (
          <Skeleton />
        ) : error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : (
          <p className="text-gray-700 italic">"{tidbit}"</p>
        )}
      </div>
    </div>
  );
};

export default InvestmentTidbit;
