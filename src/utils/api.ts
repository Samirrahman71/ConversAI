import axios from 'axios'

// Environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY
const USE_MOCK_APIS = import.meta.env.VITE_USE_MOCK_APIS === 'true'
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'
const ELEVENLABS_MODEL_ID = import.meta.env.VITE_ELEVENLABS_MODEL_ID || 'eleven_monolingual_v1'

// Rate limiting
const RATE_LIMIT = parseInt(import.meta.env.VITE_RATE_LIMIT || '10')
const rateLimitKey = 'ai_voice_assistant_requests'

// Utility function to convert AudioBuffer to WAV format
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const length = buffer.length
  const numberOfChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const bytesPerSample = 2
  const blockAlign = numberOfChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataLength = length * blockAlign
  const bufferLength = 44 + dataLength

  const arrayBuffer = new ArrayBuffer(bufferLength)
  const view = new DataView(arrayBuffer)
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  writeString(0, 'RIFF')
  view.setUint32(4, bufferLength - 8, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // PCM format
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, numberOfChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true) // 16-bit
  writeString(36, 'data')
  view.setUint32(40, dataLength, true)
  
  // Convert audio data
  let offset = 44
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]))
      view.setInt16(offset, sample * 0x7FFF, true)
      offset += 2
    }
  }
  
  return arrayBuffer
}

function checkRateLimit(): boolean {
  if (typeof window === 'undefined') return true
  
  const now = Date.now()
  const hour = 60 * 60 * 1000
  const requests = JSON.parse(localStorage.getItem(rateLimitKey) || '[]')
  
  // Remove requests older than 1 hour
  const recentRequests = requests.filter((timestamp: number) => now - timestamp < hour)
  
  if (recentRequests.length >= RATE_LIMIT) {
    throw new Error(`Rate limit exceeded. You can make up to ${RATE_LIMIT} requests per hour.`)
  }
  
  // Add current request
  recentRequests.push(now)
  localStorage.setItem(rateLimitKey, JSON.stringify(recentRequests))
  
  return true
}

// Mock responses for development
const mockLLMResponses = [
  "That's a great question! Based on my understanding, I'd say that artificial intelligence is rapidly evolving and has the potential to transform many aspects of our daily lives. From healthcare to education, AI is opening up new possibilities while also presenting challenges we need to thoughtfully address.",
  
  "I appreciate you asking! The key to success in any field often comes down to consistent practice, continuous learning, and building meaningful relationships with others in your industry. It's also important to stay curious and adapt to changing circumstances.",
  
  "That's an interesting topic to explore. From what I understand, the best approach usually involves breaking down complex problems into smaller, manageable pieces. This allows you to tackle each component systematically and build toward a comprehensive solution.",
  
  "Thank you for that question! In my experience, effective communication is about listening actively, expressing ideas clearly, and being open to different perspectives. It's also crucial to tailor your message to your audience and choose the right medium for your communication."
]

const getMockLLMResponse = (prompt: string): string => {
  // Simple hash function to get consistent responses for same prompts
  let hash = 0
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % mockLLMResponses.length
  return mockLLMResponses[index]
}

export async function generateLLMResponse(prompt: string): Promise<string> {
  checkRateLimit()
  
  console.log('🔧 API Debug Info:')
  console.log('USE_MOCK_APIS:', USE_MOCK_APIS)
  console.log('OPENAI_API_KEY exists:', !!OPENAI_API_KEY)
  console.log('Prompt:', prompt)
  
  if (USE_MOCK_APIS) {
    console.log('📝 Using mock API response')
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    return getMockLLMResponse(prompt)
  }

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your environment.')
  }
  
  console.log('🚀 Making OpenAI API call...')

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful, knowledgeable, and friendly AI assistant. Provide clear, conversational responses that sound natural when spoken aloud. Keep responses concise but informative, typically 2-4 sentences unless more detail is specifically requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    )

    const content = response.data.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response received from OpenAI')
    }

    return content.trim()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.')
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your configuration.')
      }
      if (error.response?.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.')
      }
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`)
    }
    throw error
  }
}

export async function synthesizeVoiceResponse(text: string): Promise<string> {
  console.log('🔊 Voice Synthesis Debug:')
  console.log('USE_MOCK_APIS:', USE_MOCK_APIS)
  console.log('Text to synthesize:', text)
  
  if (USE_MOCK_APIS) {
    console.log('📢 Using browser speech synthesis (mock mode)')
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
    
    // Use browser's built-in Speech Synthesis API for mock
    if ('speechSynthesis' in window) {
      // Ensure voices are loaded
      const loadVoices = () => {
        return new Promise<SpeechSynthesisVoice[]>((resolve) => {
          let voices = speechSynthesis.getVoices()
          if (voices.length > 0) {
            resolve(voices)
          } else {
            speechSynthesis.onvoiceschanged = () => {
              voices = speechSynthesis.getVoices()
              resolve(voices)
            }
          }
        })
      }
      
      const voices = await loadVoices()
      
      // Speak the text directly using the browser's TTS
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 0.8
      
      // Try to use a more natural voice
      const preferredVoices = voices.filter(voice => 
        voice.lang.startsWith('en') && (
          voice.name.includes('Google') ||
          voice.name.includes('Microsoft') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Alex')
        )
      )
      
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0]
        console.log('🎙️ Using preferred voice:', preferredVoices[0].name)
      } else if (voices.length > 0) {
        // Use the first English voice available
        const englishVoice = voices.find(voice => voice.lang.startsWith('en'))
        if (englishVoice) {
          utterance.voice = englishVoice
          console.log('🎙️ Using English voice:', englishVoice.name)
        }
      }
      
      // Add event listeners for debugging
      utterance.onstart = () => console.log('🔊 Speech synthesis started')
      utterance.onend = () => console.log('✅ Speech synthesis completed')
      utterance.onerror = (event) => console.error('❌ Speech synthesis error:', event)
      
      // Speak the text
      speechSynthesis.speak(utterance)
      
      // Create a simple audio file URL for the audio player component
      // This creates a short tone to satisfy the audio player requirement
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const sampleRate = audioContext.sampleRate
      const duration = 1 // 1 second
      const frameCount = sampleRate * duration
      const arrayBuffer = audioContext.createBuffer(1, frameCount, sampleRate)
      const channelData = arrayBuffer.getChannelData(0)
      
      // Generate a simple tone
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1
      }
      
      // Convert to blob and return URL
      const wavBuffer = audioBufferToWav(arrayBuffer)
      const blob = new Blob([wavBuffer], { type: 'audio/wav' })
      return URL.createObjectURL(blob)
    }
    
    // Fallback: return a working minimal WAV file
    const wavData = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'
    return wavData
  }

  if (!ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not configured. Using browser speech synthesis as fallback.')
    
    // Use browser's built-in Speech Synthesis API as fallback
    if ('speechSynthesis' in window) {
      // Speak the text directly
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 0.8
      
      // Try to use a more natural voice
      const voices = speechSynthesis.getVoices()
      const preferredVoices = voices.filter(voice => 
        voice.lang.startsWith('en') && (
          voice.name.includes('Google') ||
          voice.name.includes('Microsoft') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Alex')
        )
      )
      
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0]
      } else if (voices.length > 0) {
        const englishVoice = voices.find(voice => voice.lang.startsWith('en'))
        if (englishVoice) utterance.voice = englishVoice
      }
      
      speechSynthesis.speak(utterance)
      
      // Return empty string to indicate browser handled the speech
      return ''
    }
    
    console.warn('Speech synthesis not supported in this browser.')
    return ''
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        text: text,
        model_id: ELEVENLABS_MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        responseType: 'blob',
        timeout: 30000
      }
    )

    // Create blob URL for the audio
    const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })
    const audioUrl = URL.createObjectURL(audioBlob)
    
    return audioUrl
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Voice synthesis timed out. Please try again.')
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid ElevenLabs API key. Please check your configuration.')
      }
      if (error.response?.status === 429) {
        throw new Error('ElevenLabs API rate limit exceeded. Please try again later.')
      }
      throw new Error(`ElevenLabs API error: ${error.response?.status || error.message}`)
    }
    throw error
  }
}
