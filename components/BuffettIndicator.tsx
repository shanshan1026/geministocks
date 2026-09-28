import React from 'react';
import Tooltip from './Tooltip';

const BuffettIndicator: React.FC = () => {
    const indicatorValue = 89.51;
    const isHigh = indicatorValue >= 80;
    const colorClass = isHigh ? 'text-red-600' : 'text-green-600';
    const indicatorTip = "巴菲特指数（Buffett Indicator）是衡量股市总市值与国民生产总值（GDP）比率的指标。通常用于评估当前股市估值是否过高或过低。低于80%可能表示低估，高于80%则可能表示高估。点击查看实时数据。";

    return (
        <div className="mb-6">
            <a
                href="https://legulegu.com/stockdata/marketcap-gdp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-x-2 text-center p-3 rounded-2xl w-full max-w-sm mx-auto glass-refined hover-effects"
                aria-label="查看实时巴菲特指数"
            >
                <Tooltip tip={indicatorTip}>
                    <span className="font-semibold text-slate-800 text-sm sm:text-base">
                        巴菲特指数 (总市值/GDP):
                    </span>
                </Tooltip>
                <span className={`text-xl sm:text-2xl font-bold ${colorClass}`}>
                    {indicatorValue.toFixed(2)}%
                </span>
            </a>
        </div>
    );
};

export default BuffettIndicator;