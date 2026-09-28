import React from 'react';
import { AcademicCapIcon } from './icons/Icons';
import LanguageSwitcher from './LanguageSwitcher';
import { useI18n } from '../hooks/useI18n';

// Heroicons "presentation-chart-line" (MIT): a compact stock-trend mark.
const StockTrendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M3.75 3V14.25C3.75 15.4926 4.75736 16.5 6 16.5H8.25M3.75 3H2.25M3.75 3H20.25M20.25 3H21.75M20.25 3V14.25C20.25 15.4926 19.2426 16.5 18 16.5H15.75M8.25 16.5H15.75M8.25 16.5L7.25 19.5M15.75 16.5L16.75 19.5M16.75 19.5L17.25 21M16.75 19.5H7.25M7.25 19.5L6.75 21M7.5 12L10.5 9L12.6476 11.1476C13.6542 9.70301 14.9704 8.49023 16.5 7.60539"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface AppHeaderProps {
  apiConfigured: boolean;
  onOpenUserGuide: () => void;
  onOpenApiSettings: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ apiConfigured, onOpenUserGuide, onOpenApiSettings }) => {
  const { t, locale } = useI18n();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FBFBFA]/80 backdrop-blur-sm border-b border-stone-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo & Title */}
          <div className="flex min-w-0 items-center gap-x-2 sm:gap-x-3">
            <StockTrendIcon aria-hidden="true" className="h-7 w-7 shrink-0 text-emerald-700 sm:h-8 sm:w-8" />
            <h1 className="truncate whitespace-nowrap text-base font-semibold text-gray-800 sm:text-xl">
              {t('header.title')}
            </h1>
          </div>

          {/* Right side: Controls */}
          <div className="flex shrink-0 items-center gap-x-2 sm:gap-x-6">
            <button
              onClick={onOpenUserGuide}
              className="hidden sm:flex items-center gap-x-1.5 text-sm font-medium text-gray-600 hover:text-black transition-colors"
              aria-label={t('header.userGuide')}
            >
              <AcademicCapIcon className="w-5 h-5" />
              <span>{t('header.userGuide')}</span>
            </button>
            {/* API Settings button */}
            <button
              onClick={onOpenApiSettings}
              className={`flex items-center gap-x-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm transition-colors sm:px-3 sm:text-sm ${
                apiConfigured
                  ? 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                  : 'bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100'
              }`}
              aria-label={locale === 'zh' ? '模型 API 设置' : 'Model API Settings'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{locale === 'zh' ? (apiConfigured ? '模型设置' : '配置模型') : (apiConfigured ? 'API Settings' : 'Setup API')}</span>
            </button>
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
