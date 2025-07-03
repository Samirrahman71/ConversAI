import { useState } from 'react'
import { synthesizeVoiceResponse } from '../utils/api'

export function useVoice() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const synthesizeVoice = async (text: string): Promise<string | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const audioUrl = await synthesizeVoiceResponse(text)
      return audioUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to synthesize voice'
      setError(errorMessage)
      console.error('Voice synthesis error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    synthesizeVoice,
    isLoading,
    error
  }
}
