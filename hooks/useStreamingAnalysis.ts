import { useState, useCallback } from 'react'
import type { AnalysisReport, StockAnalysisReport } from '../types'
import type { Locale } from './useI18n'

type AnalysisType = 'topic' | 'stock'

interface StreamingState<T> {
  data: Partial<T> | null
  isStreaming: boolean
  error: string | null
  progress: number // 0-100
}

// Helper to parse SSE stream
async function* parseSSEStream(response: Response) {
  if (!response.body) throw new Error('No response body')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('data:')) {
        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') return
        try {
          yield JSON.parse(data)
        } catch {
          // Skip invalid JSON - might be partial text
          if (data && data !== '') {
            yield { text: data }
          }
        }
      }
    }
  }
}

// Calculate progress based on filled fields
function calculateProgress<T extends object>(data: Partial<T>, schema: (keyof T)[]): number {
  if (!data) return 0
  const filledFields = schema.filter(key => {
    const value = data[key]
    if (value === undefined || value === null) return false
    if (typeof value === 'object' && Object.keys(value).length === 0) return false
    return true
  })
  return Math.round((filledFields.length / schema.length) * 100)
}

const TOPIC_FIELDS: (keyof AnalysisReport)[] = [
  'summary',
  'investmentScore',
  'analysis',
  'marketSizeAndOutlook',
  'competitiveLandscape',
  'catalystTracker',
  'policyAnalysis',
  'techTrajectory',
  'scenarioAnalysis',
  'investmentStrategy',
  'tieredSuggestions',
]

const STOCK_FIELDS: (keyof StockAnalysisReport)[] = [
  'companyProfile',
  'investmentScore',
  'marketSentimentAnalysis',
  'financialTrends',
  'valuationAnalysis',
  'peerComparison',
  'swotAnalysis',
  'investmentThesis',
  'riskAnalysis',
  'managementAnalysis',
  'technicalAnalysis',
  'financialHealth',
  'earningsCallAnalysis',
]

export function useStreamingTopicAnalysis() {
  const [state, setState] = useState<StreamingState<AnalysisReport>>({
    data: null,
    isStreaming: false,
    error: null,
    progress: 0,
  })

  const analyze = useCallback(async (topic: string, locale: Locale) => {
    setState({ data: null, isStreaming: true, error: null, progress: 0 })

    try {
      const response = await fetch('/api/analyze-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, locale }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      let accumulatedText = ''
      let currentData: Partial<AnalysisReport> = {}

      for await (const chunk of parseSSEStream(response)) {
        if (chunk.text) {
          accumulatedText += chunk.text
          
          // Try to parse accumulated text as JSON
          try {
            // Attempt to repair and parse partial JSON
            const cleanedText = accumulatedText.trim()
            if (cleanedText.startsWith('{')) {
              // Try to parse, handling potential incomplete JSON
              let parseText = cleanedText
              
              // Count braces to see if JSON is complete
              let openBraces = 0
              let inString = false
              let escaped = false
              
              for (const char of parseText) {
                if (escaped) {
                  escaped = false
                  continue
                }
                if (char === '\\') {
                  escaped = true
                  continue
                }
                if (char === '"') {
                  inString = !inString
                  continue
                }
                if (!inString) {
                  if (char === '{') openBraces++
                  if (char === '}') openBraces--
                }
              }
              
              // If incomplete, try to close it
              if (openBraces > 0) {
                parseText += '}'.repeat(openBraces)
              }
              
              const parsed = JSON.parse(parseText)
              currentData = { ...currentData, ...parsed }
              
              const progress = calculateProgress(currentData, TOPIC_FIELDS)
              setState(prev => ({
                ...prev,
                data: currentData,
                progress,
              }))
            }
          } catch {
            // JSON not yet complete, continue accumulating
          }
        } else if (chunk.type === 'text-delta' && chunk.delta) {
          accumulatedText += chunk.delta
        }
      }

      // Final state
      setState(prev => ({
        ...prev,
        isStreaming: false,
        progress: 100,
        data: currentData,
      }))

      return currentData as AnalysisReport
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: errorMessage,
      }))
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, isStreaming: false, error: null, progress: 0 })
  }, [])

  return { ...state, analyze, reset }
}

export function useStreamingStockAnalysis() {
  const [state, setState] = useState<StreamingState<StockAnalysisReport>>({
    data: null,
    isStreaming: false,
    error: null,
    progress: 0,
  })

  const analyze = useCallback(async (stockQuery: string, locale: Locale) => {
    setState({ data: null, isStreaming: true, error: null, progress: 0 })

    try {
      const response = await fetch('/api/analyze-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuery, locale }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      let accumulatedText = ''
      let currentData: Partial<StockAnalysisReport> = {}

      for await (const chunk of parseSSEStream(response)) {
        if (chunk.text) {
          accumulatedText += chunk.text
          
          try {
            const cleanedText = accumulatedText.trim()
            if (cleanedText.startsWith('{')) {
              let parseText = cleanedText
              
              let openBraces = 0
              let inString = false
              let escaped = false
              
              for (const char of parseText) {
                if (escaped) {
                  escaped = false
                  continue
                }
                if (char === '\\') {
                  escaped = true
                  continue
                }
                if (char === '"') {
                  inString = !inString
                  continue
                }
                if (!inString) {
                  if (char === '{') openBraces++
                  if (char === '}') openBraces--
                }
              }
              
              if (openBraces > 0) {
                parseText += '}'.repeat(openBraces)
              }
              
              const parsed = JSON.parse(parseText)
              currentData = { ...currentData, ...parsed }
              
              const progress = calculateProgress(currentData, STOCK_FIELDS)
              setState(prev => ({
                ...prev,
                data: currentData,
                progress,
              }))
            }
          } catch {
            // JSON not yet complete
          }
        } else if (chunk.type === 'text-delta' && chunk.delta) {
          accumulatedText += chunk.delta
        }
      }

      setState(prev => ({
        ...prev,
        isStreaming: false,
        progress: 100,
        data: currentData,
      }))

      return currentData as StockAnalysisReport
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: errorMessage,
      }))
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, isStreaming: false, error: null, progress: 0 })
  }, [])

  return { ...state, analyze, reset }
}
