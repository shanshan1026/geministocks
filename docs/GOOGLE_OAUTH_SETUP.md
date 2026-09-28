# Google OAuth 集成文档

## 概述

本文档描述如何配置和使用 Gemini Stocks 应用中的 Google OAuth 一键登录功能。

---

## 配置信息

### 你的 Google OAuth 配置

| 项目 | 值 |
|-----|-----|
| **Google 客户端 ID** | `249907665019-71e2lkp4m8l9tf7cd6o45fuj2v08tash.apps.googleusercontent.com` |
| **状态** | ✅ 已配置 |

### 环境变量

已在项目中配置以下环境变量：

```bash
VITE_GOOGLE_CLIENT_ID=249907665019-71e2lkp4m8l9tf7cd6o45fuj2v08tash.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/auth/google/callback
```

---

## 功能特性

### 1. 一键登录
- **快速注册**：无需输入密码，点击"使用 Google 账号注册"即可完成
- **快速登录**：已注册用户可以一键登录
- **新用户奖励**：Google 注册用户额外获得 5 积分（总计 15 积分）

### 2. 账户关联
- 已有邮箱账户的用户可以关联 Google 账户
- 支持账户解绑操作
- 解绑前必须设置密码

### 3. 安全特性

#### PKCE (Proof Key for Code Exchange)
- 防止授权码被中间人攻击
- 不需要客户端密钥
- 特别适合移动应用和 SPA

#### CSRF 保护
- State 参数验证（5 分钟有效期）
- Nonce 防重放
- 时间戳验证

#### 数据加密
- 敏感信息本地存储加密
- 数据传输使用 HTTPS
- OAuth 状态定时清理

---

## 使用流程

### 用户流程图

```
用户访问登录页面
    ↓
选择"使用 Google 账号登录/注册"
    ↓
生成 PKCE 参数和 state
    ↓
重定向到 Google 登录页面
    ↓
用户授权（如果需要）
    ↓
Google 重定向回 /auth/google/callback
    ↓
处理授权码，获取用户信息
    ↓
创建/关联账户
    ↓
建立会话，自动登录
    ↓
数据同步完成
```

---

## 本地测试

### 1. 配置本地环境

```bash
# .env.local
VITE_GOOGLE_CLIENT_ID=249907665019-71e2lkp4m8l9tf7cd6o45fuj2v08tash.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

### 2. Google Cloud Console 配置

在 **已获授权的重定向 URI** 中添加：
```
http://localhost:5173/auth/google/callback
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 测试 Google 登录

1. 打开应用，点击登录按钮
2. 选择"使用 Google 账号登录"
3. 使用你的 Google 账户授权
4. 应该重定向回应用并自动登录

---

## 生产部署

### 1. 更新环境变量

```bash
# 在 Vercel 上配置
VITE_GOOGLE_CLIENT_ID=249907665019-71e2lkp4m8l9tf7cd6o45fuj2v08tash.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/auth/google/callback
```

### 2. 更新 Google Cloud Console

在 **已获授权的重定向 URI** 中添加：
```
https://your-domain.vercel.app/auth/google/callback
```

### 3. 启用发布模式

在 Google Cloud Console > OAuth 同意屏幕中：
1. 点击 **"发布应用"**
2. 确认应用详情
3. 应用切换到生产模式

---

## 故障排除

### 问题 1：重定向 URI 不匹配

**错误**：`redirect_uri_mismatch`

**解决**：
- 检查 `VITE_GOOGLE_REDIRECT_URI` 环境变量
- 确保与 Google Cloud Console 配置完全匹配
- 包括协议（http/https）和路径

### 问题 2：客户端 ID 无效

**错误**：`invalid_client`

**解决**：
- 验证 `VITE_GOOGLE_CLIENT_ID` 正确输入
- 检查 Google Cloud Console 凭据是否有效

### 问题 3：用户邮箱冲突

**错误**：`Email already exists`

**解决**：
- 用户已有邮箱账户
- 可以关联 Google 账户到现有账户
- 或使用不同的 Google 账户

---

## 常见问题（FAQ）

**Q: Google 登录后数据会丢失吗？**
A: 不会。系统会自动迁移本地数据到云端。

**Q: 可以关联多个 Google 账户吗？**
A: 目前不支持，一个账户最多关联一个 Google ID。

**Q: 如何重置 Google 关联？**
A: 在账户设置中解绑 Google 账户，需要先设置密码。

**Q: Google 登录是否安全？**
A: 是的。使用 PKCE、CSRF 保护和数据加密确保安全。

---

**文档最后更新**: 2024-04-02
**版本**: 1.0
**状态**: ✅ 生产就绪
