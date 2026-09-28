import React from 'react';
import type { StockTicker, TieredSuggestions } from '../types';
import { ExternalLinkIcon } from './icons/Icons';
import TextRenderer from './TextRenderer';
import { useI18n } from '../hooks/useI18n';

// Helper function to generate stock links
const generateStockLink = (stock: StockTicker): string => {
    const { ticker, market } = stock;
    switch (market) {
      case 'A-Share':
        const prefix = ticker.startsWith('6') ? 'sh' : 'sz';
        return `https://quote.eastmoney.com/${prefix}${ticker}.html`;
      case 'Hong Kong':
        return `https://www.google.com/finance/quote/${ticker}:HKG`;
      case 'US':
        return `https://www.google.com/finance/quote/${ticker}`;
      case 'Crypto':
        return `https://www.google.com/finance/quote/${ticker}-USD`;
      case 'Futures':
        return `https://www.google.com/finance/quote/${ticker}`;
      case 'Other':
      default:
        return `https://www.google.com/finance/q=${encodeURIComponent(ticker)}`;
    }
};

// Reusable StockCard component
const StockCard: React.FC<{ stock: StockTicker; keywords: string[]; onAnalyze?: (query: string) => void; }> = ({ stock, keywords, onAnalyze }) => {
  const { t } = useI18n();
  const relevanceConfig = {
    High: {
      label: t('relevance.High'),
      borderColor: 'border-black',
      bgColor: 'bg-gray-200',
      textColor: 'text-black'
    },
    Medium: {
      label: t('relevance.Medium'),
      borderColor: 'border-gray-500',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800'
    },
    Low: {
      label: t('relevance.Low'),
      borderColor: 'border-gray-300',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800'
    },
  };

  const config = relevanceConfig[stock.relevance] || relevanceConfig.Medium;
  const link = generateStockLink(stock);

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${config.borderColor} p-4 flex flex-col justify-between transition-shadow hover:shadow-lg h-full`}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="font-bold text-black pr-2">
                {onAnalyze ? (
                    <button
                        onClick={() => onAnalyze(stock.name)}
                        className="text-left font-bold text-black hover:text-gray-700 animated-underline transition-colors"
                    >
                        {stock.name}
                    </button>
                ) : (
                    <span>{stock.name}</span>
                )}
            </div>
            <p className="text-xs text-gray-500">({stock.market})</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor} flex-shrink-0`}>
            {t('stockCard.relevancePrefix')}: {config.label}
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          <TextRenderer text={stock.reason} keywords={keywords} />
        </p>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-x-4">
        {stock.market === 'US' && (
            <a
                href="https://mystonks.org/?code=v1B021"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-semibold text-black hover:text-gray-700 transition-colors"
                aria-label={t('stockCard.onchainStockAria', { stockName: stock.name })}
            >
                {t('stockCard.onchainStock')}
                <ExternalLinkIcon className="h-3.5 w-3.5 ml-1" />
            </a>
        )}
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center text-xs font-semibold text-black hover:text-gray-700 transition-colors"
          aria-label={t('stockCard.viewDetailsAria', { stockName: stock.name })}
        >
          {t('stockCard.viewDetails')}
          <ExternalLinkIcon className="h-3.5 w-3.5 ml-1" />
        </a>
      </div>
    </div>
  );
};

// New component for rendering a single tier
interface TierDisplayProps {
  title: string;
  icon: string;
  stocks: StockTicker[];
  keywords: string[];
  colorClasses: string;
}

const TierDisplay: React.FC<TierDisplayProps> = ({ title, icon, stocks, keywords, colorClasses }) => {
  if (!stocks || stocks.length === 0) {
    return null;
  }
  
  return (
    <div>
      <div className={`flex items-center p-3 rounded-t-lg ${colorClasses}`}>
        <span className="text-2xl mr-3" aria-hidden="true">{icon}</span>
        <h4 className="text-xl font-bold">{title}</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/50 rounded-b-lg border-x border-b border-gray-200">
        {stocks.map((stock, index) => (
          <StockCard key={`${stock.ticker}-${index}`} stock={stock} keywords={keywords} />
        ))}
      </div>
    </div>
  );
};


// Main component
interface TieredSuggestionsDisplayProps {
  suggestions: TieredSuggestions;
  keywords: string[];
}

const TieredSuggestionsDisplay: React.FC<TieredSuggestionsDisplayProps> = ({ suggestions, keywords }) => {
  const { t } = useI18n();
  const { coreHoldings, strategicSatellites, watchlist } = suggestions || {};

  return (
    <div className="space-y-8">
      <TierDisplay
        title={t('tieredSuggestions.core')}
        icon="🎯"
        stocks={coreHoldings}
        keywords={keywords}
        colorClasses="bg-gray-200 text-black"
      />
      <TierDisplay
        title={t('tieredSuggestions.satellite')}
        icon="🛰️"
        stocks={strategicSatellites}
        keywords={keywords}
        colorClasses="bg-gray-100 text-black"
      />
      <TierDisplay
        title={t('tieredSuggestions.watchlist')}
        icon="🔭"
        stocks={watchlist}
        keywords={keywords}
        colorClasses="bg-gray-100 text-black"
      />
    </div>
  );
};

export default TieredSuggestionsDisplay;
