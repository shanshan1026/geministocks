
import React from 'react';
import type { StockTicker } from '../types';
import { ExternalLinkIcon } from './icons/Icons';
import TextRenderer from './TextRenderer';
import { useI18n } from '../hooks/useI18n';

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

const StockCard: React.FC<{ stock: StockTicker; keywords: string[]; }> = ({ stock, keywords }) => {
  const { t } = useI18n();
  const relevanceConfig = {
    High: {
      label: t('relevance.High'),
      borderColor: 'border-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800'
    },
    Medium: {
      label: t('relevance.Medium'),
      borderColor: 'border-yellow-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800'
    },
    Low: {
      label: t('relevance.Low'),
      borderColor: 'border-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    },
  };

  const config = relevanceConfig[stock.relevance] || relevanceConfig.Medium;
  const link = generateStockLink(stock);

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${config.borderColor} p-4 flex flex-col justify-between transition-shadow hover:shadow-lg h-full`}>
      {/* Main content area */}
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h5 className="font-bold text-gray-800 pr-2">{stock.name}</h5>
            <p className="text-xs text-gray-500 font-mono">{stock.ticker} ({stock.market})</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor} flex-shrink-0`}>
            {t('stockCard.relevancePrefix')}: {config.label}
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          <TextRenderer text={stock.reason} keywords={keywords} />
        </p>
      </div>
      {/* Actions area */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
          aria-label={t('stockCard.viewDetailsAria', { stockName: stock.name })}
        >
          {t('stockCard.viewDetails')}
          <ExternalLinkIcon className="h-3.5 w-3.5 ml-1" />
        </a>
      </div>
    </div>
  );
};


interface StockRecommendationsProps {
  stocks: StockTicker[];
  keywords: string[];
}

const StockRecommendations: React.FC<StockRecommendationsProps> = ({ stocks, keywords }) => {
  // Group stocks by market
  const groupedStocks = stocks.reduce((acc, stock) => {
    const market = stock.market || 'Other';
    if (!acc[market]) {
      acc[market] = [];
    }
    acc[market].push(stock);
    return acc;
  }, {} as Record<string, StockTicker[]>);

  const marketOrder: (keyof typeof groupedStocks)[] = ['A-Share', 'Hong Kong', 'US', 'Crypto', 'Futures', 'Other'];
  
  const marketConfig = {
    'A-Share': { title: 'A 股', icon: '🇨🇳', color: 'bg-red-100 text-red-800' },
    'Hong Kong': { title: '港股', icon: '🇭🇰', color: 'bg-purple-100 text-purple-800' },
    'US': { title: '美股', icon: '🇺🇸', color: 'bg-blue-100 text-blue-800' },
    'Crypto': { title: '数字货币', icon: '🪙', color: 'bg-orange-100 text-orange-800' },
    'Futures': { title: '商品期货', icon: '🏭', color: 'bg-amber-100 text-amber-800' },
    'Other': { title: '其他市场', icon: '🌐', color: 'bg-gray-100 text-gray-800' },
  };

  return (
    <div className="space-y-6">
      {marketOrder.map(market => {
        if (!groupedStocks[market] || groupedStocks[market].length === 0) {
          return null;
        }
        const config = marketConfig[market as keyof typeof marketConfig];

        return (
          <div key={market}>
            <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${config.color}`}>
                <div className="flex items-center">
                    <span className="text-xl mr-2">{config.icon}</span>
                    <h4 className="text-lg font-bold">{config.title}</h4>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/50 rounded-b-lg border-x border-b border-gray-200">
              {groupedStocks[market].map((stock, index) => (
                <StockCard key={index} stock={stock} keywords={keywords} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StockRecommendations;
