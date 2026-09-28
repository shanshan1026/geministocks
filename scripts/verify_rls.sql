-- Verification Script for RLS Configuration
-- Run this to verify all RLS policies are correctly configured

-- ============================================================================
-- 1. Check RLS status on all tables
-- ============================================================================

SELECT 
  schemaname, 
  tablename, 
  rowsecurity AS "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- 2. Check all policies
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- 3. Check indexes for RLS performance
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename;

-- ============================================================================
-- 4. Test RLS with sample query (run as authenticated user)
-- ============================================================================

-- First, set a user ID:
SET app.current_user_id = 'test-user-123';

-- Then run these queries to verify RLS works:
SELECT * FROM users LIMIT 1;           -- Should only show current user
SELECT * FROM credits LIMIT 1;         -- Should only show current user's credits
SELECT * FROM analyses LIMIT 1;        -- Should only show current user's analyses
SELECT * FROM user_settings LIMIT 1;   -- Should only show current user's settings

-- ============================================================================
-- 5. Test RLS denial (switch to different user)
-- ============================================================================

SET app.current_user_id = 'different-user-456';

-- These queries should return NO results from the first user's data
SELECT * FROM users WHERE id = 'test-user-123';
SELECT * FROM credits WHERE user_id = 'test-user-123';
