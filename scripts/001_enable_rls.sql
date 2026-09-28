-- Enable Row Level Security (RLS) for all tables
-- This script implements comprehensive security policies

-- ============================================================================
-- 1. Enable RLS on all tables
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. Users Table Policies
-- ============================================================================

-- Users can only see their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (id = current_setting('app.current_user_id')::text OR id = current_user);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (id = current_setting('app.current_user_id')::text OR id = current_user)
  WITH CHECK (id = current_setting('app.current_user_id')::text OR id = current_user);

-- Only the user can delete their own account
CREATE POLICY "users_delete_own" ON users
  FOR DELETE
  USING (id = current_setting('app.current_user_id')::text OR id = current_user);

-- ============================================================================
-- 3. Credits Table Policies
-- ============================================================================

-- Users can only see their own credits
CREATE POLICY "credits_select_own" ON credits
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::text OR user_id = current_user);

-- Users can only update their own credits (handled by triggers/functions)
CREATE POLICY "credits_update_own" ON credits
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id')::text OR user_id = current_user)
  WITH CHECK (user_id = current_setting('app.current_user_id')::text OR user_id = current_user);

-- ============================================================================
-- 4. Credit Transactions Table Policies
-- ============================================================================

-- Users can only see their own transactions
CREATE POLICY "credit_transactions_select_own" ON credit_transactions
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::text OR user_id = current_user);

-- Transactions are insert-only (no update/delete for audit trail)
CREATE POLICY "credit_transactions_insert_own" ON credit_transactions
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id')::text OR user_id = current_user);

-- ============================================================================
-- 5. Analyses Table Policies
-- ============================================================================

-- Users can only see their own analyses
CREATE POLICY "analyses_select_own" ON analyses
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::text OR user_id = current_user);

-- Users can only insert their own analyses
CREATE POLICY "analyses_insert_own" ON analyses
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id')::text OR user_id = current_user);

-- Users can only update their own analyses
CREATE POLICY "analyses_update_own" ON analyses
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id')::text OR user_id = current_user)
  WITH CHECK (user_id = current_setting('app.current_user_id')::text OR user_id = current_user);

-- Users can delete their own analyses
CREATE POLICY "analyses_delete_own" ON analyses
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id')::text OR user_id = current_user);

-- ============================================================================
-- 6. User Settings Table Policies
-- ============================================================================

-- Users can only see their own settings
CREATE POLICY "user_settings_select_own" ON user_settings
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::text OR user_id = current_user);

-- Users can insert their own settings
CREATE POLICY "user_settings_insert_own" ON user_settings
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id')::text OR user_id = current_user);

-- Users can update their own settings
CREATE POLICY "user_settings_update_own" ON user_settings
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id')::text OR user_id = current_user)
  WITH CHECK (user_id = current_setting('app.current_user_id')::text OR user_id = current_user);

-- ============================================================================
-- 7. Create indexes for improved RLS performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- ============================================================================
-- 8. Verify RLS status
-- ============================================================================

-- Run this query to verify RLS is enabled:
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' AND rowsecurity = true;
