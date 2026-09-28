# App.tsx 重构计划

## 现状分析

### 代码规模
- **总行数**: 1375 行
- **useState 数量**: 46 个
- **useCallback 数量**: 12 个
- **useEffect 数量**: 7 个
- **业务逻辑**: 混合在组件内

### 状态分组

App.tsx 中的 46 个 state 可以分为 **5 个逻辑域**：

#### 1. 新闻源模块（4 个 state）
```typescript
// 行 213-217
const [articles, setArticles] = useState<NewsArticle[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [activeSourceId, setActiveSourceId] = useState<string>('36kr')
const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
```
✅ 建议：独立到 `hooks/useNewsFeeds.ts`

#### 2. 话题分析模块（8 个 state）
```typescript
// 行 546-551
const [userInput, setUserInput] = useState<string>('')
const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null)
const [isLoading, setIsLoading] = useState<boolean>(false)
const [error, setError] = useState<string | null>(null)
const [topicHistory, setTopicHistory] = useState<TopicHistoryEntry[]>([])
const [topicProgress, setTopicProgress] = useState<number>(0)
const [streamingTopicProgress, setStreamingTopicProgress] = useState<number>(0)
const [partialTopicData, setPartialTopicData] = useState<Partial<AnalysisReport> | null>(null)
```
✅ 建议：独立到 `hooks/useTopicAnalysis.ts`

#### 3. 股票分析模块（10 个 state）
```typescript
// 行 554-577
const [stockQuery, setStockQuery] = useState<string>('')
const [stockAnalysisReport, setStockAnalysisReport] = useState<StockAnalysisReport | null>(null)
const [isStockLoading, setIsStockLoading] = useState<boolean>(false)
const [stockError, setStockError] = useState<string | null>(null)
const [hotStocks, setHotStocks] = useState<...>([])
const [stockHistory, setStockHistory] = useState<StockHistoryEntry[]>([])
const [stockProgress, setStockProgress] = useState<number>(0)
const [streamingStockProgress, setStreamingStockProgress] = useState<number>(0)
const [partialStockData, setPartialStockData] = useState<Partial<StockAnalysisReport> | null>(null)
const [inlineStockAnalysisReport, setInlineStockAnalysisReport] = useState<StockAnalysisReport | null>(null)
const [isInlineStockLoading, setIsInlineStockLoading] = useState<boolean>(false)
const [inlineStockProgress, setInlineStockProgress] = useState<number>(0)
const [inlineStockError, setInlineStockError] = useState<string | null>(null)
```
✅ 建议：独立到 `hooks/useStockAnalysis.ts`

#### 4. 阵地战分析模块（8 个 state）
```typescript
// 行 563-571
const [leaderStockQuery, setLeaderStockQuery] = useState<string>('')
const [positionalWarfareReport, setPositionalWarfareReport] = useState<PositionalWarfareReport | null>(null)
const [isPositionalWarfareLoading, setIsPositionalWarfareLoading] = useState<boolean>(false)
const [positionalWarfareError, setPositionalWarfareError] = useState<string | null>(null)
const [positionalWarfareProgress, setPositionalWarfareProgress] = useState<number>(0)
const [positionalWarfareHistory, setPositionalWarfareHistory] = useState<PositionalWarfareHistoryEntry[]>([])
const [isFindingLeader, setIsFindingLeader] = useState<boolean>(false)
const [potentialLeader, setPotentialLeader] = useState<LeaderStockProfile | null>(null)
const [isConfirmingLeader, setIsConfirmingLeader] = useState<boolean>(false)
```
✅ 建议：独立到 `hooks/usePositionalWarfare.ts`

#### 5. 全局 UI 和账户模块（10 个 state）
```typescript
// 行 586-598
const [activeTab, setActiveTab] = useState<'topic' | 'stock' | 'positional'>('topic')
const [toast, setToast] = useState<{ message: string; type } | null>(null)
const [userAnalysisCount, setUserAnalysisCount] = useState<number>(0)
const [isUserGuideModalOpen, setIsUserGuideModalOpen] = useState(false)
const [isImageModalOpen, setIsImageModalOpen] = useState(false)
const [hasPaid, setHasPaid] = useState<boolean>(false)
const [credits, setCredits] = useState<number>(0)
const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
const [pendingAnalysis, setPendingAnalysis] = useState<PendingAnalysis | null>(null)
const [redemptionCode, setRedemptionCode] = useState('')
```
✅ 建议：拆分到多个 hooks：
  - `hooks/useUIState.ts` - UI 状态（tabs, modals, toast）
  - `hooks/useCreditsSystem.ts` - 积分系统（credits, hasPaid, redemption）
  - `hooks/useAnalyticsContext.ts` - 用户分析（count, pending）

---

## 重构步骤

### Phase 1: 提取 Hooks（当前）

目标：将 46 个 state 分解到 6 个自定义 hooks

#### 步骤 1.1: 创建 useTopicAnalysis Hook
```typescript
// hooks/useTopicAnalysis.ts
export function useTopicAnalysis() {
  const [userInput, setUserInput] = useState<string>('')
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [topicHistory, setTopicHistory] = useState<TopicHistoryEntry[]>([])
  const [progress, setProgress] = useState<number>(0)
  const [streamingProgress, setStreamingProgress] = useState<number>(0)
  const [partialData, setPartialData] = useState<Partial<AnalysisReport> | null>(null)

  // 业务逻辑方法
  const handleAnalyze = useCallback(async (topic: string) => { ... }, [])
  const clearAnalysis = useCallback(() => { ... }, [])
  const loadHistory = useCallback(() => { ... }, [])

  return {
    // 状态
    userInput, setUserInput,
    analysisReport, setAnalysisReport,
    isLoading, error,
    topicHistory,
    progress, streamingProgress,
    partialData,
    // 方法
    handleAnalyze, clearAnalysis, loadHistory
  }
}
```

#### 步骤 1.2: 创建 useStockAnalysis Hook
```typescript
// hooks/useStockAnalysis.ts
export function useStockAnalysis() {
  // 10 个 state + 业务逻辑
  const [stockQuery, setStockQuery] = useState<string>('')
  // ... 其他 state
  
  const handleStockAnalyze = useCallback(async (query: string) => { ... }, [])
  const handleInlineAnalyze = useCallback(async (ticker: string) => { ... }, [])
  
  return { ... }
}
```

#### 步骤 1.3: 创建其他 Hooks
```typescript
// hooks/usePositionalWarfare.ts
// hooks/useNewsFeeds.ts
// hooks/useUIState.ts
// hooks/useCreditsSystem.ts
```

### Phase 2: 提取 Contexts（后续）

将跨多个 hooks 共享的状态提取到 Context：
```typescript
// contexts/AnalysisContext.tsx
export const AnalysisProvider = ({ children }) => {
  // 共享分析相关状态
  // 为 useTopicAnalysis, useStockAnalysis 等提供共享状态
}

// contexts/UserContext.tsx
export const UserProvider = ({ children }) => {
  // 共享用户状态（credits, hasPaid 等）
}
```

### Phase 3: App.tsx 简化

重构后的 App.tsx：
```typescript
export default function App() {
  // 使用提取的 hooks
  const topic = useTopicAnalysis()
  const stock = useStockAnalysis()
  const warfare = usePositionalWarfare()
  const news = useNewsFeeds()
  const ui = useUIState()
  const credits = useCreditsSystem()

  // 主要的 render 逻辑，无业务逻辑
  return (
    <>
      <Header />
      <Tabs
        activeTab={ui.activeTab}
        onChange={ui.setActiveTab}
      >
        <TabPane name="topic">
          <TopicAnalysisTab {...topic} />
        </TabPane>
        <TabPane name="stock">
          <StockAnalysisTab {...stock} />
        </TabPane>
        <TabPane name="positional">
          <PositionalWarfareTab {...warfare} />
        </TabPane>
      </Tabs>
      <Footer />
    </>
  )
}
```

---

## 预期成果

### 代码指标

| 指标 | 当前 | 目标 | 改善 |
|-----|------|------|------|
| App.tsx 行数 | 1375 | 250 | ↓ 82% |
| 单个 useState | 46 | 0 | ✅ 全部提取 |
| 单个 useCallback | 12 | 0 | ✅ 全部提取 |
| 单个 useEffect | 7 | 0 | ✅ 全部提取 |
| 创建的 hooks 文件 | 0 | 6 | ✨ 6 个 |
| 代码可复用性 | 低 | 高 | ↑ 显著 |

### 质量改善

- ✅ **可维护性** - 每个 hook 职责单一
- ✅ **可测试性** - hooks 独立测试，无需 React 组件
- ✅ **可复用性** - 其他组件可复用这些 hooks
- ✅ **性能** - 精细化的重新渲染控制

---

## 实施时间表

| 阶段 | 任务 | 预计时间 |
|-----|------|---------|
| 1.1 | 创建 useTopicAnalysis | 1-2 h |
| 1.2 | 创建 useStockAnalysis | 1-2 h |
| 1.3 | 创建其他 4 个 hooks | 2-3 h |
| 1.4 | 更新 App.tsx | 1 h |
| 1.5 | 测试和调试 | 2 h |
| **总计** | **Phase 1** | **7-10 h** |

---

## 风险和缓解

| 风险 | 等级 | 缓解措施 |
|-----|------|---------|
| 状态依赖错误 | 中 | 逐个 hook 创建并测试 |
| 性能回归 | 低 | 使用 useMemo 和 useCallback |
| 功能破坏 | 中 | 集成测试所有功能 |

---

## 技术亮点

### 1. 状态隔离
```typescript
// 每个 hook 管理独立的状态域
const topic = useTopicAnalysis()  // 话题分析状态
const stock = useStockAnalysis()  // 股票分析状态
// 两个域完全独立，互不影响
```

### 2. 缓存机制集成
```typescript
// hooks 内部自动使用缓存
const handleAnalyze = useCallback(async (topic) => {
  const cached = await getCachedAnalysis(topic)
  if (cached) return cached  // 缓存命中
  return await performAnalysis(topic)  // 新分析
}, [])
```

### 3. 流式进度追踪
```typescript
// hooks 内置流式进度
const [streamingProgress, setStreamingProgress] = useState(0)
// 自动更新进度条
onStreamProgress?.((progress) => setStreamingProgress(progress))
```

---

## 文件结构（目标）

```
hooks/
├── useTopicAnalysis.ts       # 话题分析 (200 行)
├── useStockAnalysis.ts       # 股票分析 (250 行)
├── usePositionalWarfare.ts   # 阵地战分析 (200 行)
├── useNewsFeeds.ts           # 新闻源管理 (150 行)
├── useUIState.ts             # UI 状态管理 (100 行)
├── useCreditsSystem.ts       # 积分系统 (150 行)
└── index.ts                  # 统一导出

components/
├── TopicAnalysisTab.tsx      # 话题分析标签页
├── StockAnalysisTab.tsx      # 股票分析标签页
├── PositionalWarfareTab.tsx  # 阵地战标签页
└── ...

App.tsx                        # 主组件 (250 行，仅 render)
```

---

## 后续优化点

重构后可以进一步优化：

1. **引入状态管理库**（Zustand/Redux）
2. **提取到 Context Provider**
3. **添加 DevTools 支持**
4. **性能监控集成**
5. **单元测试编写**

