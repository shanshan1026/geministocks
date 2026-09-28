/**
 * useUIState Hook
 * 
 * Manages global UI state like tabs, modals, and toasts
 * Extracted from App.tsx
 */

import { useState, useCallback } from 'react'

interface Toast {
  message: string
  type: 'success' | 'info'
}

export function useUIState() {
  // Tab management
  const [activeTab, setActiveTab] = useState<'topic' | 'stock' | 'positional'>('topic')

  // Toast notifications
  const [toast, setToast] = useState<Toast | null>(null)

  // Modal states
  const [isUserGuideModalOpen, setIsUserGuideModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  // Show toast with auto-dismiss
  const showToast = useCallback((message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type })
    // Auto-dismiss after 3 seconds
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Close toast
  const closeToast = useCallback(() => {
    setToast(null)
  }, [])

  // Toggle user guide modal
  const toggleUserGuideModal = useCallback(() => {
    setIsUserGuideModalOpen(prev => !prev)
  }, [])

  // Toggle image modal
  const toggleImageModal = useCallback(() => {
    setIsImageModalOpen(prev => !prev)
  }, [])

  return {
    // Tab management
    activeTab,
    setActiveTab,

    // Toast
    toast,
    showToast,
    closeToast,

    // Modals
    isUserGuideModalOpen,
    setIsUserGuideModalOpen,
    toggleUserGuideModal,
    isImageModalOpen,
    setIsImageModalOpen,
    toggleImageModal
  }
}

export type UseUIStateReturn = ReturnType<typeof useUIState>
