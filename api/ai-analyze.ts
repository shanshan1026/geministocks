import type { VercelRequest, VercelResponse } from '@vercel/node'

// Security: Verify API key is not exposed in this file
if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not configured in server environment')
}

/**
 * Secure AI Analysis API Route
 * 
 * This route handles all AI API calls server-side, ensuring API keys
 * are never exposed to the client.
 * 
 * Usage:
 * POST /api/ai-analyze
 * {
 *   "prompt": "User's analysis request",
 *   "systemInstruction": "System prompt",
 *   "userId": "user-id-for-rls"
 * }
 */

interface AnalysisRequest {
  prompt: string
  systemInstruction: string
  userId: string
  modelName?: string
}

interface AnalysisResponse {
  success: boolean
  data?: string
  error?: string
  executionTime?: number
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    })
  }

  try {
    const startTime = Date.now()
    const { prompt, systemInstruction, userId, modelName = 'openai/gpt-5-mini' } = req.body as AnalysisRequest

    // Validate input
    if (!prompt || !systemInstruction || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: prompt, systemInstruction, userId',
      })
    }

    // Validate user ID format (basic check)
    if (typeof userId !== 'string' || userId.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId format',
      })
    }

    console.log(`[API] Processing AI analysis for user ${userId}`)

    // Call OpenRouter API securely from server
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: systemInstruction,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`[API] OpenRouter API error: ${response.status} - ${error}`)
      return res.status(response.status).json({
        success: false,
        error: `AI Service error: ${response.statusText}`,
      })
    }

    const data = await response.json()
    const result = data.choices?.[0]?.message?.content

    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response from AI service',
      })
    }

    const executionTime = Date.now() - startTime
    console.log(`[API] Analysis completed in ${executionTime}ms for user ${userId}`)

    return res.status(200).json({
      success: true,
      data: result,
      executionTime,
    })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    })
  }
}
