-- 订阅计划表
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  price_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  billing_cycle VARCHAR(20) NOT NULL, -- 'monthly'
  stripe_price_id VARCHAR(255) UNIQUE,
  
  -- 配额和特性
  analysis_limit_per_month INTEGER, -- NULL 表示无限
  monthly_bonus_credits INTEGER DEFAULT 0,
  unlock_premium_models BOOLEAN DEFAULT FALSE,
  priority_queue BOOLEAN DEFAULT FALSE,
  
  -- 显示和排序
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户订阅表
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  plan_id INTEGER NOT NULL,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  
  -- 状态
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'paused', 'past_due'
  
  -- 时间信息
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  renews_at TIMESTAMP NOT NULL,
  canceled_at TIMESTAMP,
  
  -- 本月使用情况（针对 Lite 用户）
  current_month_analyses INTEGER DEFAULT 0,
  current_month_reset_at TIMESTAMP,
  
  -- 自动续约
  auto_renew BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  UNIQUE(user_id, status) -- 用户同时只能有一个活跃订阅
);

-- 订阅交易表（支付历史）
CREATE TABLE IF NOT EXISTS subscription_transactions (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER NOT NULL,
  stripe_invoice_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255),
  
  -- 交易信息
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL, -- 'pending', 'succeeded', 'failed'
  payment_method VARCHAR(50), -- 'card', 'bank_transfer', 'other'
  
  -- 时间
  billing_date TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  
  -- 重试信息
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE CASCADE
);

-- 订阅事件日志（审计和分析）
CREATE TABLE IF NOT EXISTS subscription_events (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'created', 'upgraded', 'downgraded', 'canceled', 'renewed', 'paused'
  previous_plan_id INTEGER,
  new_plan_id INTEGER,
  details JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (previous_plan_id) REFERENCES subscription_plans(id),
  FOREIGN KEY (new_plan_id) REFERENCES subscription_plans(id)
);

-- 用户积分赠送记录表
CREATE TABLE IF NOT EXISTS credit_grants (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  credits INTEGER NOT NULL,
  reason VARCHAR(100) NOT NULL, -- 'subscription_bonus', 'referral', 'promotion', 'support'
  source_id VARCHAR(255), -- subscription_id 或其他
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引优化
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_renews_at ON user_subscriptions(renews_at);
CREATE INDEX idx_subscription_transactions_subscription_id ON subscription_transactions(subscription_id);
CREATE INDEX idx_subscription_events_subscription_id ON subscription_events(subscription_id);
CREATE INDEX idx_credit_grants_user_id ON credit_grants(user_id);

-- 初始化三档订阅计划
INSERT INTO subscription_plans (name, slug, description, price_cents, billing_cycle, display_order, analysis_limit_per_month, monthly_bonus_credits, unlock_premium_models, priority_queue)
VALUES
  ('Lite', 'lite', '基础版 - 每月 100 次分析', 490, 'monthly', 1, 100, 30, FALSE, FALSE),
  ('Pro', 'pro', '专业版 - 无限分析 + 优先处理', 990, 'monthly', 2, NULL, 50, FALSE, TRUE),
  ('Premium', 'premium', '高级版 - 全功能 + 高级模型', 1990, 'monthly', 3, NULL, 100, TRUE, TRUE);
