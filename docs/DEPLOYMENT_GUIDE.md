# Gemini Stocks - 生产部署指南

## 目录

1. [部署前准备](#部署前准备)
2. [Vercel 部署](#vercel-部署)
3. [环境变量配置](#环境变量配置)
4. [数据库配置](#数据库配置)
5. [Google OAuth 配置](#google-oauth-配置)
6. [监控配置](#监控配置)
7. [部署后验证](#部署后验证)
8. [故障排除](#故障排除)

---

## 部署前准备

### 系统要求

| 项目 | 要求 |
|-----|------|
| Node.js | >= 18.0.0 |
| npm | >= 9.0.0 |
| Git | 最新版本 |

### 必需账户

- [x] Vercel 账户 (https://vercel.com)
- [x] Neon 数据库账户 (https://neon.tech)
- [x] Google Cloud 账户 (如需 Google 登录)
- [ ] Sentry 账户 (可选，用于错误监控)

### 本地验证

在部署前，确保本地构建成功：

```bash
# 安装依赖
npm install

# 类型检查
npm run typecheck

# 构建测试
npm run build

# 预览构建结果
npm run preview
```

---

## Vercel 部署

### 方式一：通过 Vercel Dashboard (推荐)

1. **导入项目**
   - 访问 https://vercel.com/new
   - 选择 "Import Git Repository"
   - 连接 GitHub 仓库

2. **配置项目**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **添加环境变量**
   - 点击 "Environment Variables"
   - 添加所有必需的环境变量（见下文）

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成

### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

### 方式三：通过 GitHub 自动部署

1. 在 Vercel Dashboard 中连接 GitHub 仓库
2. 配置自动部署触发器：
   - Production Branch: `main`
   - Preview Branches: `dev`, `staging`, `feature/*`
3. 推送代码自动触发部署

---

## 环境变量配置

### 必需变量

| 变量名 | 描述 | 示例 |
|-------|------|------|
| `VITE_OPENROUTER_API_KEY` | OpenRouter API Key | `sk-or-v1-REDACTED` |
| `DATABASE_URL` | Neon 数据库连接字符串 | `postgresql://user:pass@host/db` |

### Google OAuth 变量

| 变量名 | 描述 | 示例 |
|-------|------|------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 客户端 ID | `xxx.apps.googleusercontent.com` |
| `VITE_GOOGLE_REDIRECT_URI` | OAuth 回调 URL | `https://your-domain.vercel.app/auth/google/callback` |

### 监控变量 (可选)

| 变量名 | 描述 | 示例 |
|-------|------|------|
| `VITE_SENTRY_DSN` | Sentry DSN | `https://xxx@sentry.io/xxx` |
| `VITE_SENTRY_ENVIRONMENT` | 环境标识 | `production` |
| `VITE_SENTRY_TRACES_SAMPLE_RATE` | 采样率 | `0.1` |

### 在 Vercel 中添加环境变量

1. 进入项目 Settings > Environment Variables
2. 添加变量，选择适用环境：
   - Production
   - Preview
   - Development
3. 保存后重新部署

---

## 数据库配置

### Neon 数据库设置

1. **创建项目**
   - 访问 https://console.neon.tech
   - 创建新项目
   - 选择区域（建议选择靠近用户的区域）

2. **获取连接字符串**
   - 在项目 Dashboard 中复制连接字符串
   - 格式：`postgresql://username:password@host/database?sslmode=require`

3. **运行数据库迁移**
   ```bash
   # 使用项目中的迁移脚本
   npm run db:migrate
   ```

4. **验证连接**
   ```bash
   # 测试数据库连接
   npm run db:test
   ```

### 数据库架构

确保以下表已创建：
- `users` - 用户信息
- `credits` - 积分余额
- `credit_transactions` - 积分交易记录
- `analyses` - 分析历史
- `user_settings` - 用户设置

---

## Google OAuth 配置

### 生产环境配置步骤

1. **Google Cloud Console 配置**
   - 访问 https://console.cloud.google.com/apis/credentials
   - 选择你的 OAuth 2.0 客户端

2. **添加生产 URL**
   
   在 "已获授权的 JavaScript 来源" 中添加：
   ```
   https://your-domain.vercel.app
   ```

   在 "已获授权的重定向 URI" 中添加：
   ```
   https://your-domain.vercel.app/auth/google/callback
   ```

3. **发布 OAuth 应用**
   - 进入 OAuth 同意屏幕
   - 点击 "发布应用"
   - 完成验证流程（如需要）

4. **更新环境变量**
   ```
   VITE_GOOGLE_CLIENT_ID=你的客户端ID
   VITE_GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/auth/google/callback
   ```

---

## 监控配置

### Sentry 设置 (推荐)

1. **创建 Sentry 项目**
   - 访问 https://sentry.io
   - 创建新项目，选择 "React"

2. **获取 DSN**
   - 在项目设置中复制 DSN

3. **配置环境变量**
   ```
   VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
   VITE_SENTRY_ENVIRONMENT=production
   VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
   ```

4. **配置告警**
   - 设置错误通知
   - 配置性能告警阈值

### 性能监控

应用自动追踪以下指标：
- 页面加载时间
- API 请求延迟
- 用户交互响应时间
- 错误率和类型

---

## 部署后验证

### 功能检查清单

#### 基础功能
- [ ] 应用可访问
- [ ] 页面加载正常
- [ ] 样式显示正确
- [ ] 无 JavaScript 错误

#### 认证功能
- [ ] 邮箱注册
- [ ] 邮箱登录
- [ ] Google 登录
- [ ] 登出功能
- [ ] 会话持久化

#### 核心功能
- [ ] 话题分析
- [ ] 股票分析
- [ ] 阵地战分析
- [ ] 积分消耗
- [ ] 历史记录

#### 数据同步
- [ ] 跨设备登录
- [ ] 数据同步
- [ ] 积分同步

### 性能指标

| 指标 | 目标值 |
|-----|-------|
| 首次内容绘制 (FCP) | < 1.5s |
| 最大内容绘制 (LCP) | < 2.5s |
| 交互时间 (TTI) | < 3.5s |
| 累积布局偏移 (CLS) | < 0.1 |

### 安全检查

- [ ] HTTPS 已启用
- [ ] 安全头已配置
- [ ] API Key 未暴露
- [ ] CORS 配置正确

---

## 故障排除

### 常见问题

#### 1. 构建失败

**问题**: TypeScript 类型错误

**解决**:
```bash
npm run typecheck
# 修复报告的类型错误
```

#### 2. 环境变量未生效

**问题**: 应用无法访问环境变量

**解决**:
- 确保变量名以 `VITE_` 开头
- 重新部署应用
- 检查变量是否添加到正确的环境

#### 3. Google 登录失败

**问题**: redirect_uri_mismatch

**解决**:
- 检查 Google Cloud Console 中的重定向 URI
- 确保 URI 完全匹配（包括协议和路径）

#### 4. 数据库连接失败

**问题**: 无法连接到 Neon 数据库

**解决**:
- 验证 DATABASE_URL 格式正确
- 检查 Neon 项目状态
- 确认 SSL 模式为 require

#### 5. 页面 404 错误

**问题**: 刷新页面显示 404

**解决**:
- 检查 vercel.json 中的 rewrites 配置
- 确保 SPA 路由正确配置

### 日志查看

```bash
# Vercel 部署日志
vercel logs

# 实时日志
vercel logs --follow
```

### 回滚部署

```bash
# 查看部署历史
vercel ls

# 回滚到特定部署
vercel rollback [deployment-url]
```

---

## 持续集成

### GitHub Actions 配置

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run typecheck
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 维护和更新

### 定期检查

- [ ] 每周检查错误日志
- [ ] 每月审查性能指标
- [ ] 定期更新依赖
- [ ] 备份数据库

### 依赖更新

```bash
# 检查过期依赖
npm outdated

# 更新依赖
npm update

# 更新主要版本
npx npm-check-updates -u
npm install
```

---

## 支持

如遇问题，请检查：
1. Vercel 部署日志
2. 浏览器控制台错误
3. Sentry 错误报告
4. 本文档的故障排除部分

---

**文档版本**: 1.0
**最后更新**: 2024-04-02
