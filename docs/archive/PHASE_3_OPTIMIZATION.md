# 第三阶段优化 - 代码分割、性能监控和新功能

**阶段**: Phase 3  
**时间**: Week 3-4  
**主要工作**: 代码分割、性能监控、测试框架、新功能

---

## 1. 代码分割和路由懒加载优化

### 当前情况
- 所有 JavaScript 打包为单个文件
- 首屏加载包含所有页面代码
- 无法充分利用浏览器缓存

### 优化目标

| 指标 | 目标 | 预期改善 |
|-----|------|---------|
| 首屏 JS | < 200KB | ↓ 60-70% |
| LCP | < 2.5s | ↓ 40-50% |
| 缓存命中 | > 80% | ↑ 显著 |
| 并行下载 | > 90% | ↑ 显著 |

### 实施方案

#### 1.1 Vite 配置优化

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  // 代码分割策略
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 第三方库分离
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-tabs'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['lodash-es', 'date-fns'],
          
          // 功能块分离
          'analysis-topic': ['./hooks/useTopicAnalysis'],
          'analysis-stock': ['./hooks/useStockAnalysis'],
          'analysis-warfare': ['./hooks/usePositionalWarfare'],
          
          // 服务分离
          'services-ai': ['./services/aiClientService', './services/parallelAIService'],
          'services-cache': ['./services/cacheService'],
          'services-error': ['./services/errorHandler']
        }
      }
    },
    // 其他优化
    minify: 'terser',
    sourcemap: false,
    reportCompressedSize: false
  },
  
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'recharts',
      '@radix-ui/react-tabs'
    ]
  }
}))
```

#### 1.2 动态导入（Lazy Loading）

```typescript
// 组件懒加载
import { lazy, Suspense } from 'react'

const TopicAnalysisTab = lazy(() => import('./components/TopicAnalysisTab'))
const StockAnalysisTab = lazy(() => import('./components/StockAnalysisTab'))
const PositionalWarfareTab = lazy(() => import('./components/PositionalWarfareTab'))

// 使用 Suspense
<Suspense fallback={<SkeletonLoader />}>
  <TopicAnalysisTab {...props} />
</Suspense>
```

#### 1.3 路由级别代码分割

```typescript
// routes.ts - 如果使用路由器
const routes = [
  {
    path: '/analysis',
    component: lazy(() => import('./pages/Analysis'))
  },
  {
    path: '/history',
    component: lazy(() => import('./pages/History'))
  },
  {
    path: '/settings',
    component: lazy(() => import('./pages/Settings'))
  }
]
```

### 预期成果

```
分割前:
app.js: 850KB (未压缩) / 280KB (压缩)
├── 首屏加载: 280KB
├── 缓存命中: 0%
└── LCP: 3.2s

分割后:
app.js: 150KB (首屏)
├── vendor-react.js: 120KB (缓存，长期)
├── vendor-ui.js: 80KB (缓存，长期)
├── analysis-topic.js: 60KB (按需)
├── services-ai.js: 45KB (按需)
└── LCP: 1.8s (↓ 44%)
```

---

## 2. 性能监控集成

### 监控指标

#### Core Web Vitals
```typescript
// LCP (Largest Contentful Paint)
// 目标: < 2.5s
// 影响: 50% 权重（Google 排名）

// FID (First Input Delay)
// 目标: < 100ms
// 影响: 用户体验

// CLS (Cumulative Layout Shift)
// 目标: < 0.1
// 影响: 视觉稳定性
```

#### 自定义指标
```typescript
interface PerformanceMetrics {
  // AI 分析性能
  aiAnalysisTime: number
  cacheHitRate: number
  
  // 网络性能
  apiResponseTime: number
  networkLatency: number
  
  // UI 性能
  componentRenderTime: number
  reRenderCount: number
}
```

### 实施方案

#### 2.1 Web Vitals 采集

```typescript
// services/performanceMonitor.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function initPerformanceMonitoring() {
  // 采集 Core Web Vitals
  getCLS(sendMetric)
  getFID(sendMetric)
  getFCP(sendMetric)
  getLCP(sendMetric)
  getTTFB(sendMetric)
}

function sendMetric(metric) {
  console.log(`[Performance] ${metric.name}: ${metric.value}ms`)
  
  // 发送到分析服务（后续）
  // analytics.send(metric)
}
```

#### 2.2 自定义性能追踪

```typescript
// services/performanceMonitor.ts
export class PerformanceTracker {
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number> = new Map()
  
  startMeasure(name: string) {
    this.marks.set(name, performance.now())
  }
  
  endMeasure(name: string) {
    const start = this.marks.get(name)
    if (!start) return
    
    const duration = performance.now() - start
    this.measures.set(name, duration)
    
    console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`)
    
    // 监控长任务
    if (duration > 100) {
      console.warn(`[Perf] Slow task: ${name} (${duration}ms)`)
    }
  }
  
  getMetrics() {
    return Object.fromEntries(this.measures)
  }
}
```

#### 2.3 React 性能分析

```typescript
// hooks/usePerformanceMonitor.ts
import { useEffect, Profiler } from 'react'

export function useComponentPerformance(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const renderTime = performance.now() - startTime
      console.log(`[Component] ${componentName} render: ${renderTime.toFixed(2)}ms`)
    }
  }, [componentName])
}

// 在组件中使用
function TopicAnalysisTab() {
  useComponentPerformance('TopicAnalysisTab')
  // ...
}
```

#### 2.4 长任务监测

```typescript
// services/longTaskMonitor.ts
export function monitorLongTasks() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.warn(`[LongTask] ${entry.name}: ${entry.duration}ms`)
        
        // 自动报告到分析服务
        reportLongTask(entry)
      }
    })
    
    observer.observe({ entryTypes: ['longtask'] })
  }
}
```

### 监控仪表板数据结构

```typescript
interface PerformanceDashboard {
  webVitals: {
    lcp: number        // ms
    fid: number        // ms
    cls: number        // 0-1
  }
  
  customMetrics: {
    aiAnalysisTime: number
    cacheHitRate: number     // 0-100%
    apiResponseTime: number
  }
  
  resourceTiming: {
    totalResources: number
    cachedResources: number
    networkResources: number
  }
  
  userExperience: {
    slowTransactions: number
    errorRate: number
    satisfaction: number      // 1-5
  }
}
```

---

## 3. 测试框架搭建

### 框架选择

**推荐**: Vitest + @testing-library/react

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```

### 测试覆盖范围

#### 3.1 Hooks 单元测试

```typescript
// hooks/__tests__/useTopicAnalysis.test.ts
import { renderHook, act } from '@testing-library/react'
import { useTopicAnalysis } from '../useTopicAnalysis'

describe('useTopicAnalysis', () => {
  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useTopicAnalysis(mockOptions))
    
    expect(result.current.userInput).toBe('')
    expect(result.current.analysisReport).toBeNull()
  })
  
  it('should handle analysis successfully', async () => {
    const { result } = renderHook(() => useTopicAnalysis(mockOptions))
    
    await act(async () => {
      await result.current.handleAnalyze('test topic')
    })
    
    expect(result.current.analysisReport).toBeDefined()
  })
})
```

#### 3.2 服务单元测试

```typescript
// services/__tests__/errorHandler.test.ts
import { handleError, ErrorType, AppError } from '../errorHandler'

describe('errorHandler', () => {
  it('should classify network errors', () => {
    const error = new Error('Network error')
    error.code = 'ECONNREFUSED'
    
    const appError = handleError(error, 'test')
    expect(appError.type).toBe(ErrorType.NetworkError)
  })
})
```

#### 3.3 组件集成测试

```typescript
// components/__tests__/TopicAnalysisTab.integration.test.ts
import { render, screen, userEvent } from '@testing-library/react'
import TopicAnalysisTab from '../TopicAnalysisTab'

describe('TopicAnalysisTab Integration', () => {
  it('should complete analysis workflow', async () => {
    render(<TopicAnalysisTab {...mockProps} />)
    
    const input = screen.getByPlaceholderText(/输入话题/)
    await userEvent.type(input, 'AI投资')
    
    const button = screen.getByText(/分析/)
    await userEvent.click(button)
    
    // 等待结果
    expect(await screen.findByText(/投资评分/)).toBeInTheDocument()
  })
})
```

### 测试覆盖目标

| 类型 | 覆盖率 | 文件数 |
|-----|--------|--------|
| Hooks | 80%+ | 6 个 |
| Services | 70%+ | 4 个 |
| Components | 60%+ | 8 个 |
| E2E | 关键流程 | 5 个 |
| 总体 | 70%+ | 23 个 |

---

## 4. AI 对话追问功能

### 功能描述

用户可以对已生成的分析报告进行后续提问，建立对话上下文。

### 实现架构

```
用户分析报告
    ↓
   [Conversation State]
    ├── 上下文（报告内容）
    ├── 对话历史
    └── 当前消息
    ↓
[AI 处理]
    ├── 考虑报告内容
    ├── 维持对话一致性
    └── 生成追问答案
    ↓
   用户看到答案
```

### 代码实现

```typescript
// hooks/useAnalysisConversation.ts
export function useAnalysisConversation(initialReport: AnalysisReport) {
  const [conversationHistory, setConversationHistory] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const addFollowUpQuestion = useCallback(
    async (question: string) => {
      setIsLoading(true)
      
      try {
        // 构建上下文
        const context = buildContext(initialReport, conversationHistory)
        
        // 调用 AI
        const answer = await callAISecurely({
          prompt: question,
          systemInstruction: `基于以下分析报告，回答用户的问题:\n\n${context}`,
          userId: getCurrentUserId()
        })
        
        // 添加到对话历史
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: question },
          { role: 'assistant', content: answer }
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed')
      } finally {
        setIsLoading(false)
      }
    },
    [initialReport, conversationHistory]
  )
  
  return {
    conversationHistory,
    isLoading,
    error,
    addFollowUpQuestion
  }
}
```

### UI 组件

```typescript
// components/AnalysisConversation.tsx
export function AnalysisConversation({ report }) {
  const conversation = useAnalysisConversation(report)
  const [inputValue, setInputValue] = useState('')
  
  const handleSend = async () => {
    await conversation.addFollowUpQuestion(inputValue)
    setInputValue('')
  }
  
  return (
    <div className="conversation">
      {/* 原始报告 */}
      <AnalysisReport report={report} />
      
      {/* 对话历史 */}
      <div className="messages">
        {conversation.conversationHistory.map((msg, idx) => (
          <Message key={idx} {...msg} />
        ))}
      </div>
      
      {/* 输入框 */}
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="追问..."
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend} disabled={conversation.isLoading}>
        发送
      </button>
    </div>
  )
}
```

---

## 5. 完整的实施时间表

| 任务 | 工时 | 优先级 | 依赖 |
|-----|------|--------|------|
| 代码分割配置 | 2-3h | P1 | 无 |
| 动态导入实施 | 2-3h | P1 | 配置完成 |
| Web Vitals 监控 | 1-2h | P2 | 无 |
| 自定义指标 | 2-3h | P2 | 无 |
| 测试框架搭建 | 1-2h | P2 | 无 |
| Hooks 测试 | 3-4h | P3 | 框架完成 |
| 追问功能实现 | 3-4h | P2 | Hooks 完成 |
| 追问 UI 组件 | 2-3h | P2 | 功能完成 |
| 集成与验证 | 2-3h | P1 | 全部完成 |
| **总计** | **20-27h** | - | - |

---

## 6. 成功标志

完成第三阶段的验收标准：

✅ 首屏 JS < 200KB (达到目标减少 60%+)
✅ LCP < 2.5s (改善 40-50%)
✅ 缓存命中率 > 80%
✅ 测试覆盖率 > 70%
✅ 追问功能可用
✅ 性能指标完整记录
✅ 文档完整更新

---

## 7. 关键文件清单

将创建/修改：
- `vite.config.ts` - 代码分割配置
- `services/performanceMonitor.ts` - 性能监控
- `hooks/useAnalysisConversation.ts` - 追问对话
- `components/AnalysisConversation.tsx` - 追问 UI
- `vitest.config.ts` - 测试框架配置
- `__tests__/` - 测试文件目录

