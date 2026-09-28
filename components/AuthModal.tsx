/**
 * Authentication Modal Component
 * 
 * Provides login and registration UI with form validation
 */

import React, { useState } from 'react'
import { XIcon, UserIcon, EnvelopeIcon, LockIcon, SparklesIcon } from './icons/Icons'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (email: string, password: string, username: string) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

type AuthMode = 'login' | 'register'

export default function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  isLoading = false,
  error = null
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    // Validation
    if (!email.trim()) {
      setLocalError('请输入邮箱地址')
      return
    }

    if (!password.trim()) {
      setLocalError('请输入密码')
      return
    }

    if (password.length < 6) {
      setLocalError('密码至少需要6个字符')
      return
    }

    if (mode === 'register') {
      if (!username.trim()) {
        setLocalError('请输入用户名')
        return
      }

      if (username.length < 2) {
        setLocalError('用户名至少需要2个字符')
        return
      }

      if (password !== confirmPassword) {
        setLocalError('两次输入的密码不一致')
        return
      }

      try {
        await onRegister(email, password, username)
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : '注册失败')
      }
    } else {
      try {
        await onLogin(email, password)
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : '登录失败')
      }
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setLocalError(null)
    setPassword('')
    setConfirmPassword('')
  }

  const displayError = localError || error

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="bg-white p-8 max-w-md w-full mx-4 relative animate-reveal-scale rounded-2xl shadow-floating"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="关闭"
        >
          <XIcon className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? '欢迎回来' : '创建账户'}
          </h2>
          <p className="text-gray-500 mt-2">
            {mode === 'login' ? '登录以同步您的数据' : '注册以开始使用所有功能'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username (register only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                用户名
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="您的昵称"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              邮箱地址
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              密码
            </label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少6个字符"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Confirm Password (register only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                确认密码
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {displayError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600 text-center">{displayError}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                处理中...
              </span>
            ) : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {mode === 'login' ? '还没有账户？' : '已有账户？'}
            <button
              type="button"
              onClick={switchMode}
              className="ml-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              disabled={isLoading}
            >
              {mode === 'login' ? '立即注册' : '立即登录'}
            </button>
          </p>
        </div>

        {/* Benefits */}
        {mode === 'register' && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">注册后您将获得</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                10 积分赠送
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                多端数据同步
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                历史记录保存
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                分析报告导出
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
