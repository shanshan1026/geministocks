import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon } from './icons/Icons';
import { useI18n } from '../hooks/useI18n';

const AboutPage: React.FC = () => {
  const { t, locale } = useI18n();
  
  useEffect(() => {
    const title = t('aboutPage.title') + " - " + t('header.title');
    const description = t('aboutPage.subtitle');

    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
  }, [t, locale]);

  return (
    <div className="min-h-screen font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 space-y-8 shadow-soft">
        
        <header className="text-center border-b border-gray-200 pb-6">
          <h1 className="text-4xl sm:text-5xl font-light text-gradient-primary">
            {t('aboutPage.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('aboutPage.subtitle')}
          </p>
        </header>

        <section aria-labelledby="app-purpose">
          <h2 id="app-purpose" className="text-2xl font-semibold text-black mb-4">{t('aboutPage.purposeTitle')}</h2>
          <p className="text-gray-700 leading-relaxed">
            {t('aboutPage.purposeText')}
          </p>
        </section>

        <section aria-labelledby="app-features">
          <h2 id="app-features" className="text-2xl font-semibold text-black mb-4">{t('aboutPage.featuresTitle')}</h2>
          <ul className="list-disc list-inside space-y-3 text-gray-700">
            <li>
              <strong>{t('aboutPage.feature1').split(':')[0]}:</strong> 
              {t('aboutPage.feature1').split(':')[1]}
            </li>
            <li>
              <strong>{t('aboutPage.feature2').split(':')[0]}:</strong> 
              {t('aboutPage.feature2').split(':')[1]}
            </li>
            <li>
              <strong>{t('aboutPage.feature3').split(':')[0]}:</strong> 
              {t('aboutPage.feature3').split(':')[1]}
            </li>
            <li>
              <strong>{t('aboutPage.feature4').split(':')[0]}:</strong> 
              {t('aboutPage.feature4').split(':')[1]}
            </li>
            <li>
              <strong>{t('aboutPage.feature5').split(':')[0]}:</strong> 
              {t('aboutPage.feature5').split(':')[1]}
            </li>
          </ul>
        </section>
        
        <footer className="text-center pt-6 border-t border-gray-200">
            <Link 
                to="/"
                className="relative inline-flex items-center gap-2 px-8 py-3 btn-premium text-white text-base font-medium rounded-xl group overflow-hidden shadow-lg hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 active:scale-95"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                <SparklesIcon className="w-5 h-5" />
                <span className="relative z-10">{t('aboutPage.backButton')}</span>
            </Link>
        </footer>

      </div>
    </div>
  );
};

export default AboutPage;