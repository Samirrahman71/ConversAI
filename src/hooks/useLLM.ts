import { useState } from 'react'
import { generateLLMResponse } from '../utils/api'

export function useLLM() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateResponse = async (prompt: string): Promise<string> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await generateLLMResponse(prompt)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate response'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    generateResponse,
    isLoading,
    error
  }
}
