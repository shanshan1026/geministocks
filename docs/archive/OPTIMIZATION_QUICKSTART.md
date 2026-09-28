# 系统优化快速启动指南

## 前置要求

- Node.js 18+
- Neon PostgreSQL 账户（可选但推荐）
- Sentry 账户（可选）

## 安装步骤

### 1. 安装新依赖

```bash
pnpm install
# 或
npm install
# 或
yarn install
```

这会自动安装所有新添加的依赖，包括：
- `ai@^6.0.0`
- `@ai-sdk/react@^3.0.0`
- `@sentry/react@^8.0.0`

### 2. 配置环境变量

编辑或创建 `.env.development.local` 文件：

```env
# 现有配置
VITE_OPENROUTER_API_KEY=your_key_here
VITE_CLERK_PUBLISHABLE_KEY=your_key_here

# 新增配置（可选）
VITE_SENTRY_DSN=https://your-key@sentry.io/your-project-id
VITE_NEON_CONNECTION_STRING=postgresql://user:password@host/database
```

### 3. 测试缓存功能

1. 启动开发服务器：
```bash
pnpm dev
```

2. 在左下角应该看到缓存统计信息（仅开发模式）

3. 执行相同的分析查询两次：
   - 第一次：正常分析
   - 第二次：应该立即返回（从缓存）

### 4. 验证错误监控

如果配置了 Sentry DSN：

1. 打开浏览器开发者工具
2. 在控制台执行以下命令测试：
   ```javascript
   // 测试错误捕获
   throw new Error('Test error');
   ```

3. 检查 Sentry 控制台是否收到错误

## 功能验证清单

- [ ] 缓存统计显示正常
- [ ] 相同查询第二次返回速度明显更快
- [ ] 错误监控正常工作
- [ ] 历史记录能保存到数据库（如果配置）
- [ ] 页面加载没有错误

## 故障排查

### 问题：缓存统计未显示
- 检查是否在开发模式运行（`npm run dev`）
- 检查浏览器控制台是否有错误

### 问题：Sentry 未捕获错误
- 确认 `VITE_SENTRY_DSN` 已正确配置
- 检查 Sentry 项目设置是否启用了错误追踪

### 问题：数据库连接失败
- 验证 `VITE_NEON_CONNECTION_STRING` 格式正确
- 检查网络连接是否可访问数据库

### 问题：缓存始终未命中
- 确保输入的查询内容完全相同
- 查看浏览器控制台日志中的缓存日志

## 性能测试

### 测试缓存效果

```javascript
// 在浏览器控制台运行
console.time('First call')
// 执行第一次分析
console.timeEnd('First call')

console.time('Cached call')
// 执行相同的分析（应该很快）
console.timeEnd('Cached call')

// 对比时间差异
```

### 监控缓存大小

缓存统计框显示当前缓存条数，预期：
- 频繁查询的话题：10-50 条
- 热门股票：20-100 条

## 部署到生产环境

### Vercel 部署

1. 确保所有环境变量已在 Vercel 项目设置中配置
2. 推送代码到 GitHub
3. Vercel 会自动部署

### 配置生产环境变量

在 Vercel 项目设置 → Environment Variables 中添加：

```
VITE_SENTRY_DSN=production_dsn
VITE_NEON_CONNECTION_STRING=production_connection_string
DATABASE_URL=production_connection_string
```

## 监控和维护

### 定期检查

- **每周**：查看 Sentry 错误报告
- **每月**：审查缓存大小和命中率
- **每月**：验证数据库连接正常

### 性能优化

如果缓存变得过大：
1. 减少 TTL（编辑 `cacheService.ts` 中的 `defaultTTL`）
2. 手动清理缓存：控制台运行 `clearAllCaches()`

### 日志级别

开发模式下的日志：
```
[v0] Cache hit for query: ...
[v0] Cache cleanup scheduled
[v0] AI Service Error: ...
```

生产模式下这些日志会被隐藏。

## 下一步

优化任务完成后的建议步骤：

1. **立即**
   - 在生产环境配置 Sentry
   - 验证缓存功能正常
   - 测试错误监控

2. **1-2 周内**
   - 监控系统稳定性
   - 收集性能指标
   - 收集用户反馈

3. **2-4 周内**
   - 启用 RLS 数据库安全
   - 添加速率限制
   - 优化数据库查询

## 获取帮助

- 查看 `OPTIMIZATION_SUMMARY.md` 获取详细的技术文档
- 检查 `services/` 目录下的新服务文件
- 查看 `components/` 中的新组件实现

---

**最后更新：** 2025-04-01
**版本：** 1.0
