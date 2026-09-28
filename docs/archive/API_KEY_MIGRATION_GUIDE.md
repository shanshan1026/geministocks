# API Key 迁移指南

## 概述

本指南说明如何从客户端直接调用 OpenRouter API 迁移到安全的服务端 API 路由。这确保敏感的 API 密钥永远不会暴露给客户端。

## 当前状态（不安全）

### 问题
```typescript
// ❌ 不安全 - API Key 暴露在浏览器
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  headers: {
    Authorization: `Bearer ${OPENROUTER_API_KEY}` // ⚠️ 可从浏览器获取
  }
})
```

### 风险
- API Key 在浏览器中可见（DevTools → Network）
- 恶意用户可复制并滥用 Key
- 无法审核或限制访问
- API 使用成本失控

## 目标状态（安全）

### 解决方案架构

```
┌─────────────────────────────────┐
│   客户端 (React/Browser)         │
├─────────────────────────────────┤
│ callAISecurely({                │
│   prompt,                       │
│   systemInstruction,            │
│   userId                        │
│ })                              │
│                                 │
│ No sensitive keys! ✓            │
└────────────────┬────────────────┘
                 │ POST /api/ai-analyze
                 ▼
┌─────────────────────────────────┐
│  服务端 API 路由 (Vercel)        │
├─────────────────────────────────┤
│ 1. 验证请求                     │
│ 2. 读取 OPENROUTER_API_KEY      │
│    (process.env)                │
│ 3. 调用 OpenRouter              │
│ 4. 返回结果                     │
│                                 │
│ API Key 安全 ✓                  │
└────────────────┬────────────────┘
                 │ POST https://openrouter.ai
                 ▼
        ┌─────────────────┐
        │  OpenRouter API │
        └─────────────────┘
```

## 实施步骤

### 1. 部署服务端 API 路由

**文件**: `api/ai-analyze.ts`

已创建完整的 Vercel Serverless Function，处理：
- 请求验证
- API Key 管理（从 `process.env.OPENROUTER_API_KEY`）
- AI 服务调用
- 错误处理和日志

### 2. 配置环境变量

#### 本地开发
```bash
# .env.development.local
OPENROUTER_API_KEY=sk-or-v1-REDACTED  # 服务端 Key
VITE_API_URL=http://localhost:3000  # 可选，本地 API URL
```

#### Vercel 部署
1. 登录 Vercel Dashboard
2. 项目 → Settings → Environment Variables
3. 添加 `OPENROUTER_API_KEY`（仅服务端）
4. 确保 `VITE_OPENROUTER_API_KEY` 从项目中移除或设为空

### 3. 使用新的客户端服务

#### 旧方式（不要使用）
```typescript
// ❌ 过时
import { getAnalysis } from './services/geminiService'
const result = await getAnalysis(topic, setProgress, locale)
```

#### 新方式
```typescript
// ✅ 安全
import { callAISecurely, callAIParallel } from './services/aiClientService'

// 单个请求
const result = await callAISecurely({
  prompt: userQuery,
  systemInstruction: systemPrompt,
  userId: currentUserId,
  modelName: 'openai/gpt-5-mini'
}, (progress) => console.log(progress))

// 并行请求
const [part1, part2, part3] = await callAIParallel([
  { prompt: prompt1, systemInstruction: sys1, userId },
  { prompt: prompt2, systemInstruction: sys2, userId },
  { prompt: prompt3, systemInstruction: sys3, userId }
])
```

### 4. 更新应用代码

#### 示例：更新 geminiService.ts

```typescript
import { callAISecurely, callAIParallel } from './aiClientService'

// 旧方法 - 保留作为备份
async function callOpenRouterAI_legacy(...) { /* ... */ }

// 新方法 - 使用服务端 API
export async function getAnalysis(
  topic: string,
  onProgress: (step: number) => void,
  locale: Locale
): Promise<AnalysisReport> {
  const userId = getCurrentUserId() // 从应用获取
  
  onProgress(0) // 开始
  
  try {
    // 使用安全的 API
    const analysisJson = await callAISecurely({
      prompt: topic,
      systemInstruction: ANALYSIS_SYSTEM_PROMPT,
      userId,
      modelName: 'openai/gpt-5-mini'
    })
    
    onProgress(1) // 完成
    
    // 解析结果...
    return parseResponse(analysisJson)
  } catch (error) {
    console.error('Analysis failed:', error)
    throw error
  }
}
```

### 5. 迁移路径（零停机）

#### Phase 1 - 并行部署（1 小时）
```
时间    客户端          服务端 API      OpenRouter
─────────────────────────────────────────────────
T0     使用旧方法      无法使用
T1     同时使用两个    ✓ 就绪         ✓
T2     渐进式切换      ✓ 监控
T3     100% 新方法     ✓ 维护旧支持
```

#### Phase 2 - 验证（1 天）
```
- 监控 API 日志
- 验证所有分析功能正常
- 检查性能和错误率
- 收集用户反馈
```

#### Phase 3 - 清理（1 周后）
```
- 移除旧的直接 API 调用
- 删除客户端 VITE_OPENROUTER_API_KEY
- 更新文档
- 完全迁移完成
```

## 配置检查清单

- [ ] 服务端 API 路由已部署（`api/ai-analyze.ts`）
- [ ] 环境变量已配置（`OPENROUTER_API_KEY` 仅在服务端）
- [ ] 客户端服务已创建（`services/aiClientService.ts`）
- [ ] 应用代码已更新使用新服务
- [ ] 测试所有 AI 分析功能
- [ ] 监控 API 日志无错误
- [ ] 移除客户端 API Key 从代码和 `.env`
- [ ] 更新文档和用户文档

## 故障排除

### 问题：API 返回 401 Unauthorized

**原因**: `OPENROUTER_API_KEY` 未在服务端设置

**解决**:
```bash
# 验证环境变量
echo $OPENROUTER_API_KEY  # 应该显示 Key 的前缀

# 在 Vercel Dashboard 检查
# Settings → Environment Variables → OPENROUTER_API_KEY
```

### 问题：CORS 错误

**原因**: 开发时 API URL 不正确

**解决**:
```typescript
// 确保 VITE_API_URL 正确
const apiUrl = import.meta.env.VITE_API_URL || '/api/ai-analyze'
console.log('[Debug] API URL:', apiUrl)  // 检查值
```

### 问题：性能下降

**原因**: 额外的网络跃点（客户端 → 服务端 → OpenRouter）

**解决**:
- 在服务端启用请求缓存
- 使用 CDN 加速
- 优化 AI prompt 长度

```typescript
// 在 api/ai-analyze.ts 中添加缓存
const cacheKey = `${userId}:${prompt.substring(0, 50)}`
const cached = cache.get(cacheKey)
if (cached) return cached  // 秒级返回
```

## 安全最佳实践

### 1. 环境变量隔离

```typescript
// ✅ 安全 - 仅在服务端
// api/ai-analyze.ts
const apiKey = process.env.OPENROUTER_API_KEY

// ❌ 不安全 - 暴露在客户端
// services/aiService.ts
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
```

### 2. 请求验证

```typescript
// 验证用户身份
if (!userId) {
  throw new Error('Unauthorized')
}

// 验证请求大小
if (prompt.length > 50000) {
  throw new Error('Request too large')
}

// 速率限制
if (tooManyRequests(userId)) {
  throw new Error('Rate limited')
}
```

### 3. 日志记录

```typescript
// 记录审计日志
console.log({
  timestamp: new Date(),
  userId,
  action: 'ai_analysis',
  status: 'success',
  executionTime
})
```

### 4. 错误处理

```typescript
// 不泄露敏感信息
try {
  // ...
} catch (error) {
  // ❌ 错误 - 泄露内部细节
  // return { error: error.message }
  
  // ✅ 正确 - 通用错误
  return { error: 'Analysis failed. Please try again.' }
}
```

## 监控和维护

### 关键指标

| 指标 | 警戈值 | 检查间隔 |
|-----|--------|---------|
| API 响应时间 | > 10s | 每分钟 |
| 错误率 | > 5% | 每分钟 |
| 请求量 | 异常峰值 | 每小时 |

### 日志查询

```bash
# Vercel 日志
vercel logs --source=api/ai-analyze

# 查找错误
vercel logs --source=api/ai-analyze --error

# 实时尾随
vercel logs --source=api/ai-analyze --follow
```

## 完成检查清单

- [ ] 所有 AI 调用通过服务端 API
- [ ] 客户端代码无 API Key
- [ ] 性能满足需求（< 30s）
- [ ] 错误处理完善
- [ ] 日志和监控就位
- [ ] 文档已更新
- [ ] 团队培训完成

---

**迁移完成时，系统安全性将大幅提升！**
