# 订阅制系统 - 快速开始指南

## 5 分钟快速集成

### 步骤 1: 数据库迁移

```bash
psql -U your_user -d your_db -f scripts/01_create_subscription_tables.sql
```

### 步骤 2: 配置环境变量

在你的 `.env.development.local` 或 `.env.production` 中添加:

```bash
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 步骤 3: 在 App.tsx 中集成

```typescript
import { useSubscription } from './hooks/useSubscription';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SubscriptionStatus } from './components/SubscriptionStatus';
import { useState } from 'react';

export default function App() {
  const { user } = useAuth(); // 你的认证
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  const {
    subscription,
    canPerformAnalysis,
    analysisMessage,
    recordUsage,
    refreshSubscription
  } = useSubscription(user?.id || '');

  // 分析前检查权限
  const handleAnalyze = async () => {
    if (!canPerformAnalysis) {
      alert(analysisMessage || '请升级订阅');
      setShowSubscriptionModal(true);
      return;
    }

    // 执行分析
    const result = await performAnalysis();

    // 记录使用
    await recordUsage();

    return result;
  };

  return (
    <>
      {/* 显示订阅状态 */}
      <SubscriptionStatus
        subscription={subscription}
        onUpgradeClick={() => setShowSubscriptionModal(true)}
      />

      {/* 订阅管理模态框 */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        userId={user?.id || ''}
        currentPlanId={subscription?.planId}
        onClose={() => setShowSubscriptionModal(false)}
        onSuccess={() => {
          setShowSubscriptionModal(false);
          refreshSubscription();
        }}
      />

      {/* 分析按钮 */}
      <button onClick={handleAnalyze}>
        开始分析
      </button>
    </>
  );
}
```

### 步骤 4: Stripe 配置

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com)
2. 创建三个产品 (Lite, Pro, Premium)
3. 创建对应的价格 (按月)
4. 配置 Webhook:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - 事件: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`

### 步骤 5: 测试

```bash
# 测试订阅创建
curl -X POST http://localhost:3000/api/subscriptions/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "email": "test@example.com",
    "planId": 1,
    "stripePriceId": "price_xxx",
    "returnUrl": "http://localhost:3000/subscription"
  }'
```

---

## 常用 API

### useSubscription Hook

```typescript
const {
  subscription,        // 当前订阅信息 or null
  plans,              // 所有可用计划
  loading,            // 加载状态
  error,              // 错误信息
  canPerformAnalysis, // 是否可以分析
  analysisLimitReached, // 是否达到限额
  analysisMessage,    // 限额信息
  refreshSubscription, // 刷新订阅
  recordUsage         // 记录使用
} = useSubscription(userId);
```

### 订阅服务函数

```typescript
import { 
  getSubscriptionPlans,
  getUserSubscription,
  createSubscription,
  updateSubscriptionPlan,
  cancelSubscription,
  canPerformAnalysis,
  recordAnalysisUsage
} from './services/subscriptionService';

// 获取计划列表
const plans = await getSubscriptionPlans();

// 获取用户订阅
const sub = await getUserSubscription(userId);

// 创建订阅
const newSub = await createSubscription(userId, planId);

// 升级/降级
const updated = await updateSubscriptionPlan(userId, newPlanId);

// 取消订阅
await cancelSubscription(userId);

// 检查权限
const { allowed, reason } = await canPerformAnalysis(userId);

// 记录使用
await recordAnalysisUsage(userId);
```

---

## 数据模型

### 订阅计划

```typescript
interface SubscriptionPlan {
  id: number;
  name: string; // 'Lite', 'Pro', 'Premium'
  slug: 'lite' | 'pro' | 'premium';
  priceCents: number; // 490 = $4.90
  analysisLimitPerMonth?: number; // 100 for Lite, null for others
  monthlyBonusCredits: number; // 30, 50, 100
  unlockPremiumModels: boolean;
  priorityQueue: boolean;
}
```

### 用户订阅

```typescript
interface UserSubscription {
  id: number;
  userId: string;
  planId: number;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'paused' | 'past_due';
  startedAt: string;
  renews_at: string;
  currentMonthAnalyses: number; // Lite only
}
```

---

## 关键事件

### Checkout Flow

1. 用户点击选择计划
2. 调用 `/api/subscriptions/checkout`
3. 重定向到 Stripe Checkout
4. 支付完成
5. Stripe 发送 `checkout.session.completed` 事件
6. 创建本地订阅记录
7. 用户收到积分

### Subscription Update

1. 用户升级/降级
2. Stripe 更新订阅
3. Stripe 发送 `customer.subscription.updated` 事件
4. 更新本地计划
5. 发放差价积分

### Auto Renewal

1. 月度续约
2. Stripe 发送 `invoice.payment_succeeded` 事件
3. 续约订阅期限
4. 重置使用计数
5. 发放月度积分

---

## 故障排除

### 订阅不创建

**检查清单:**
- [ ] Stripe API 密钥正确
- [ ] 数据库表已创建
- [ ] 用户 ID 有效
- [ ] 查看服务器日志

### Webhook 不工作

**检查清单:**
- [ ] Webhook URL 公开可访问
- [ ] 签名密钥正确
- [ ] 防火墙允许 Stripe IP
- [ ] 查看 Stripe Dashboard 日志

### 积分不发放

**检查清单:**
- [ ] `grantCredits` 函数正确
- [ ] 数据库有 `credit_grants` 表
- [ ] Webhook 被调用
- [ ] 查看数据库日志

---

## 性能优化

```typescript
// 使用 SWR 缓存订阅数据
import useSWR from 'swr';

function useSubscriptionData(userId: string) {
  const { data, mutate } = useSWR(
    userId ? `/api/user/${userId}/subscription` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 } // 1 分钟缓存
  );
  
  return { data, mutate };
}
```

---

## 安全考虑

- ✅ 不要信任客户端的 planId，在服务器验证
- ✅ 验证所有 Stripe Webhook 签名
- ✅ 使用环保变量存储 API 密钥
- ✅ 对敏感 API 应用速率限制
- ✅ 定期检查审计日志

---

## 下一步

1. 阅读完整文档: [docs/SUBSCRIPTION_IMPLEMENTATION.md](docs/SUBSCRIPTION_IMPLEMENTATION.md)
2. 在 staging 测试
3. 配置监控和告警
4. 部署到生产

---

**需要帮助？** 查看完整文档或提交 issue。
