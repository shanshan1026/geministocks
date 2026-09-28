# Row Level Security (RLS) 实施指南

## 概述

本指南说明如何在 Gemini Stocks 系统中实施和验证行级安全 (RLS)。RLS 提供数据库级别的安全保护，确保用户只能访问自己的数据。

## 架构

### 当前 RLS 覆盖的表

| 表名 | 策略 | 说明 |
|-----|------|------|
| users | SELECT, UPDATE, DELETE | 用户只能操作自己的账户 |
| credits | SELECT, UPDATE | 用户只能查看和修改自己的积分 |
| credit_transactions | SELECT, INSERT | 交易记录只读，新增记录 |
| analyses | SELECT, INSERT, UPDATE, DELETE | 用户只能操作自己的分析报告 |
| user_settings | SELECT, INSERT, UPDATE | 用户只能操作自己的设置 |

### RLS 如何工作

1. **用户认证**：用户登录时获得 user_id
2. **上下文设置**：每次数据库操作前，设置 `app.current_user_id`
3. **策略检查**：数据库自动检查用户是否有权访问该行
4. **结果过滤**：只返回符合策略的行

```
用户请求 → 设置 RLS 上下文 → 执行 SQL 查询 → 数据库自动过滤 → 返回结果
                     ↓
            只返回 user_id 匹配的行
```

## 实施步骤

### 1. 应用迁移脚本

在 Neon 数据库上运行 `scripts/001_enable_rls.sql`：

```bash
# 使用 Neon CLI
neon sql --file scripts/001_enable_rls.sql

# 或通过 Vercel 运行迁移
npm run migrate:rls
```

**脚本内容**：
- 在所有表上启用 RLS
- 创建为每个表创建策略
- 创建性能优化索引

### 2. 应用程序集成

#### 2.1 使用 RLS 数据库服务

```typescript
import { queryWithRLS, insertWithRLS, updateWithRLS } from '@/services/database'

// 查询用户的分析
const analyses = await queryWithRLS(
  userId, 
  'SELECT * FROM analyses WHERE user_id = $1',
  [userId]
)

// 插入新分析
const analysis = await insertWithRLS(
  userId,
  'INSERT INTO analyses (user_id, input_query, result) VALUES ($1, $2, $3) RETURNING *',
  [userId, query, result]
)
```

#### 2.2 在服务中设置用户上下文

```typescript
// services/creditsService.ts
export async function getUserCredits(userId: string) {
  const credits = await queryWithRLS(
    userId,
    'SELECT * FROM credits WHERE user_id = $1',
    [userId]
  )
  return credits[0]
}

export async function deductCredits(userId: string, amount: number) {
  return updateWithRLS(
    userId,
    'UPDATE credits SET balance = balance - $1 WHERE user_id = $2 RETURNING *',
    [amount, userId]
  )
}
```

### 3. 验证配置

#### 3.1 检查 RLS 状态

运行 `scripts/verify_rls.sql` 中的验证查询：

```sql
-- 检查 RLS 是否启用
SELECT schemaname, tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

预期输出：所有 5 个表显示 `rowsecurity = true`

#### 3.2 测试策略

```sql
-- 设置用户 A
SET app.current_user_id = 'user-a-123';
SELECT * FROM analyses;  -- 应该只显示 user-a-123 的分析

-- 切换到用户 B
SET app.current_user_id = 'user-b-456';
SELECT * FROM analyses;  -- 应该只显示 user-b-456 的分析，看不到用户 A 的数据
```

## 关键实施注意事项

### 1. 上下文设置必须正确

每次数据库操作都必须设置 RLS 上下文：

```typescript
// ❌ 错误 - 忘记设置上下文
await client.query('SELECT * FROM analyses')

// ✅ 正确 - 使用 queryWithRLS 自动设置
await queryWithRLS(userId, 'SELECT * FROM analyses')
```

### 2. 用户 ID 必须一致

确保应用中的 user_id 与数据库中的 user_id 格式一致：

```typescript
// 检查用户 ID 格式
console.log(typeof userId)  // 应该是 string
console.log(userId.length)  // 确保非空
```

### 3. 性能考虑

RLS 查询会略慢于无 RLS 查询，但提供了重要的安全性。为了优化：

1. **使用索引**：已创建 `user_id` 索引
2. **批量操作**：使用事务处理多行操作
3. **缓存**：在应用层缓存常用查询

```typescript
// 使用事务优化批量操作
await transactionWithRLS(userId, async (client) => {
  // 多个操作在一个事务中执行
  await insertWithRLS(userId, ...) 
  await updateWithRLS(userId, ...)
})
```

### 4. 错误处理

RLS 违规会导致查询返回 0 行，而不是抛出错误：

```typescript
// 如果用户无权访问，result 将为空数组
const result = await queryWithRLS(
  userId,
  'SELECT * FROM analyses WHERE id = $1',
  [analysisId]
)

if (result.length === 0) {
  // 可能是无权访问或记录不存在
  throw new Error('Analysis not found or access denied')
}
```

## 故障排除

### 问题：所有查询返回空结果

**可能原因**：user_id 不匹配或未设置上下文

**解决**：
```typescript
// 检查上下文设置
const result = await client.query("SELECT current_setting('app.current_user_id')")
console.log(result.rows[0])  // 应该显示正确的 user_id
```

### 问题：权限拒绝错误

**可能原因**：RLS 策略有语法错误

**解决**：
```sql
-- 检查策略定义
SELECT * FROM pg_policies WHERE tablename = 'analyses'
```

### 问题：性能下降

**可能原因**：缺少索引或查询未优化

**解决**：
```sql
-- 检查索引
SELECT * FROM pg_indexes WHERE schemaname = 'public'

-- 解释查询执行计划
EXPLAIN ANALYZE SELECT * FROM analyses WHERE user_id = 'test-user'
```

## 迁移策略

### 从无 RLS 到有 RLS

1. **阶段 1 - 准备**（当前）
   - 创建 RLS 策略
   - 准备应用代码
   - 在测试环境验证

2. **阶段 2 - 部署**
   - 部署数据库迁移
   - 部署应用代码（可能需要同时部署）
   - 监控错误和性能

3. **阶段 3 - 验证**
   - 测试所有用户操作
   - 验证数据隔离
   - 监控日志和指标

## 最佳实践

1. **始终使用 RLS 包装函数**
   ```typescript
   // ✅ 好
   await queryWithRLS(userId, sql, params)
   
   // ❌ 避免
   await directQuery(sql, params)
   ```

2. **在应用层添加额外验证**
   ```typescript
   // 即使 RLS 保护，也验证所有权
   const analysis = await getAnalysis(analysisId)
   if (analysis.user_id !== userId) {
     throw new Error('Unauthorized')
   }
   ```

3. **使用事务处理关键操作**
   ```typescript
   await transactionWithRLS(userId, async (client) => {
     // 原子性操作
   })
   ```

4. **定期审查日志**
   ```sql
   -- 检查 RLS 相关的错误
   SELECT * FROM pg_log WHERE message LIKE '%RLS%'
   ```

## 测试检查清单

- [ ] 所有表都启用了 RLS
- [ ] 所有策略都已创建
- [ ] 用户只能看到自己的数据
- [ ] 性能索引已创建
- [ ] 应用代码使用 RLS 包装函数
- [ ] 已测试跨用户的数据隔离
- [ ] 错误处理正确
- [ ] 监控和日志就位

## 参考资源

- [PostgreSQL RLS 文档](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Neon RLS 指南](https://neon.tech/docs/introduction/row-level-security)
- [数据库服务实现](./services/database.ts)
