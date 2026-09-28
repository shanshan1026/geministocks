import React, { useState, useEffect } from 'react'
import { topicAnalysisCache } from '../services/cacheService'

/**
 * 缓存统计组件 - 显示当前缓存中存储的分析数量
 * 仅在开发模式下显示
 */
export function CacheStats() {
  const [topicCacheSize, setTopicCacheSize] = useState(0)

  useEffect(() => {
    // 定期更新缓存统计信息
    const interval = setInterval(() => {
      const topicStats = topicAnalysisCache.getStats()
      setTopicCacheSize(topicStats.size)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // 仅在开发模式显示
  if (import.meta.env.PROD) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        padding: '12px 16px',
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 999,
        maxWidth: '250px',
      }}
    >
      <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>缓存统计</div>
      <div>话题分析缓存: {topicCacheSize}</div>
    </div>
  )
}
