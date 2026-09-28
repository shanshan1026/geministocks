import React from 'react'
import { useI18n } from '../hooks/useI18n'

interface StreamingLoaderProps {
  progress: number
  isStreaming: boolean
  type: 'topic' | 'stock' | 'positional'
}

const TOPIC_STAGES = {
  zh: [
    { threshold: 10, label: '分析核心概念...' },
    { threshold: 25, label: '研究产业链结构...' },
    { threshold: 40, label: '评估市场规模...' },
    { threshold: 55, label: '分析竞争格局...' },
    { threshold: 70, label: '追踪催化剂事件...' },
    { threshold: 85, label: '制定投资策略...' },
    { threshold: 95, label: '生成股票建议...' },
    { threshold: 100, label: '完成报告...' },
  ],
  en: [
    { threshold: 10, label: 'Analyzing core concepts...' },
    { threshold: 25, label: 'Researching industry chain...' },
    { threshold: 40, label: 'Evaluating market size...' },
    { threshold: 55, label: 'Analyzing competitive landscape...' },
    { threshold: 70, label: 'Tracking catalysts...' },
    { threshold: 85, label: 'Formulating investment strategy...' },
    { threshold: 95, label: 'Generating stock suggestions...' },
    { threshold: 100, label: 'Finalizing report...' },
  ],
}

const STOCK_STAGES = {
  zh: [
    { threshold: 10, label: '获取公司信息...' },
    { threshold: 20, label: '分析市场情绪...' },
    { threshold: 35, label: '评估财务趋势...' },
    { threshold: 50, label: '进行估值分析...' },
    { threshold: 65, label: '对比同业公司...' },
    { threshold: 75, label: '执行 SWOT 分析...' },
    { threshold: 85, label: '分析技术指标...' },
    { threshold: 95, label: '生成投资论点...' },
    { threshold: 100, label: '完成报告...' },
  ],
  en: [
    { threshold: 10, label: 'Fetching company profile...' },
    { threshold: 20, label: 'Analyzing market sentiment...' },
    { threshold: 35, label: 'Evaluating financial trends...' },
    { threshold: 50, label: 'Performing valuation analysis...' },
    { threshold: 65, label: 'Comparing with peers...' },
    { threshold: 75, label: 'Executing SWOT analysis...' },
    { threshold: 85, label: 'Analyzing technical indicators...' },
    { threshold: 95, label: 'Generating investment thesis...' },
    { threshold: 100, label: 'Finalizing report...' },
  ],
}

const POSITIONAL_STAGES = {
  zh: [
    { threshold: 20, label: '识别行业龙头...' },
    { threshold: 45, label: '筛选潜力补涨股...' },
    { threshold: 70, label: '分析财务指标...' },
    { threshold: 90, label: '制定阵地战策略...' },
    { threshold: 100, label: '完成报告...' },
  ],
  en: [
    { threshold: 20, label: 'Identifying industry leader...' },
    { threshold: 45, label: 'Screening follower candidates...' },
    { threshold: 70, label: 'Analyzing financial metrics...' },
    { threshold: 90, label: 'Formulating positional strategy...' },
    { threshold: 100, label: 'Finalizing report...' },
  ],
}

export const StreamingLoader: React.FC<StreamingLoaderProps> = ({ 
  progress, 
  isStreaming,
  type 
}) => {
  const { locale } = useI18n()
  
  const stages = type === 'topic' 
    ? TOPIC_STAGES[locale] 
    : type === 'stock' 
    ? STOCK_STAGES[locale] 
    : POSITIONAL_STAGES[locale]

  const currentStage = stages.find(stage => progress <= stage.threshold) || stages[stages.length - 1]

  if (!isStreaming) return null

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
              <svg 
                className="w-5 h-5 text-white animate-pulse" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                />
              </svg>
            </div>
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-xl bg-black/20 animate-ping" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {locale === 'zh' ? 'AI 正在分析' : 'AI Analyzing'}
            </h3>
            <p className="text-sm text-gray-500">{currentStage.label}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">
              {locale === 'zh' ? '分析进度' : 'Analysis Progress'}
            </span>
            <span className="font-mono text-gray-900">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-gray-700 to-black rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stage indicators */}
        <div className="flex flex-wrap gap-2 mt-4">
          {stages.map((stage, index) => {
            const isComplete = progress >= stage.threshold
            const isCurrent = currentStage === stage
            
            return (
              <div 
                key={index}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-all duration-300
                  ${isComplete 
                    ? 'bg-black text-white' 
                    : isCurrent 
                    ? 'bg-gray-200 text-gray-800 animate-pulse' 
                    : 'bg-gray-100 text-gray-400'}
                `}
              >
                {isComplete && (
                  <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {stage.label.replace('...', '')}
              </div>
            )
          })}
        </div>

        {/* Streaming indicator */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>{locale === 'zh' ? '实时流式输出中' : 'Streaming live results'}</span>
        </div>
      </div>
    </div>
  )
}

export default StreamingLoader
