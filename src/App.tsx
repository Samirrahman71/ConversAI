import { useState, useEffect, useRef } from 'react'
import { Message } from './types/index'
import { InputBox } from './components/InputBox'
import { DarkModeToggle } from './components/DarkModeToggle'
import { useLLM } from './hooks/useLLM'
import { useVoice } from './hooks/useVoice'
import { Volume2, VolumeX, Sparkles, Mic, MicOff, Play, Pause } from 'lucide-react'

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null)
  const [transcript, setTranscript] = useState('')
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)
  const [hasUserGesture, setHasUserGesture] = useState(false)
  
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const { generateResponse, isLoading: isLLMLoading, error: llmError } = useLLM()
  const { synthesizeVoice, isLoading: isVoiceLoading, error: voiceError } = useVoice()

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        setVoiceSupported(true)
        const recognition = new SpeechRecognition()
        recognition.continuous = true  // Keep listening continuously
        recognition.interimResults = true
        recognition.lang = 'en-US'
        // recognition.maxAlternatives = 1  // Not supported in all browsers

        recognition.onstart = () => {
          console.log('🎤 Voice recognition started')
          setIsListening(true)
          setTranscript('')
        }

        recognition.onresult = (event) => {
          let finalTranscript = ''
          let interimTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            console.log('✅ Final transcript:', finalTranscript)
            setInputValue(finalTranscript)
            setTranscript('')
            setHasUserGesture(true) // Mark that user has interacted
            
            // Stop listening before submitting to prevent interference
            recognition.stop()
            handleSubmit(finalTranscript)
          } else {
            console.log('📝 Interim transcript:', interimTranscript)
            setTranscript(interimTranscript)
          }
        }

        recognition.onerror = (event: any) => {
          console.error('❌ Speech recognition error:', event.error)
          console.error('Error details:', event)
          
          // Handle different error types
          if (event.error === 'not-allowed') {
            setIsListening(false)
            setTranscript('')
            alert('Microphone access denied. Please allow microphone access and try again.')
          } else if (event.error === 'no-speech') {
            console.log('⚠️ No speech detected, continuing to listen...')
            // Don't stop listening for no-speech errors
          } else if (event.error === 'aborted') {
            console.log('🛑 Speech recognition aborted')
            setIsListening(false)
            setTranscript('')
          } else {
            console.error('Other speech recognition error:', event.error)
            setIsListening(false)
            setTranscript('')
          }
        }

        recognition.onend = () => {
          console.log('🎤 Voice recognition ended')
          setIsListening(false)
          setTranscript('')
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    try {
      const response = await generateResponse(text)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response,
        timestamp: Date.now(),
      }

      setMessages(prev => [...prev, aiMessage])

      // Generate voice response if enabled
      if (isVoiceEnabled) {
        try {
          console.log('🔊 Generating voice response...')
          console.log('- Voice enabled:', isVoiceEnabled)
          console.log('- Has user gesture:', hasUserGesture)
          console.log('- Response text:', response.substring(0, 100) + '...')
          
          const audioUrl = await synthesizeVoice(response)
          console.log('🎵 Voice synthesis result:', audioUrl ? 'SUCCESS' : 'FAILED')
          
          if (audioUrl) {
            setCurrentAudioUrl(audioUrl)
            console.log('🔊 Audio URL set:', audioUrl.substring(0, 50) + '...')
            
            // Auto-play if we have an audio element and user gesture
            if (audioRef.current && hasUserGesture) {
              console.log('🎧 Attempting auto-play...')
              audioRef.current.src = audioUrl
              audioRef.current.play().then(() => {
                console.log('✅ Auto-play started successfully')
                setIsPlaying(true)
              }).catch(error => {
                console.error('❌ Auto-play failed:', error)
                console.log('💡 Click the play button to hear the response')
              })
            } else {
              console.log('⚠️ Auto-play skipped - audioRef:', !!audioRef.current, 'hasUserGesture:', hasUserGesture)
            }
          } else {
            console.error('❌ No audio URL returned from voice synthesis')
          }
        } catch (voiceErr) {
          console.error('❌ Voice synthesis failed:', voiceErr)
        }
      } else {
        console.log('🔇 Voice output disabled')
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: Date.now(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const startListening = async () => {
    if (!voiceSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    // Request microphone permission first
    try {
      console.log('🎤 Requesting microphone permission...')
      setIsRequestingPermission(true)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('✅ Microphone permission granted')
      setIsRequestingPermission(false)
      setHasUserGesture(true) // Mark user gesture for audio playback
      
      // Initialize audio context for better audio support
      if (!audioContextRef.current) {
        try {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
          console.log('🎵 Audio context initialized')
        } catch (error) {
          console.warn('Could not initialize audio context:', error)
        }
      }
      
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop())
      
      // Now start speech recognition
      if (recognitionRef.current && !isListening) {
        console.log('🎤 Starting voice recognition...')
        try {
          recognitionRef.current.start()
        } catch (error) {
          console.error('Error starting recognition:', error)
          if (error instanceof Error && error.message.includes('already started')) {
            console.log('Recognition already running, stopping first...')
            recognitionRef.current.stop()
            setTimeout(() => {
              recognitionRef.current.start()
            }, 100)
          } else {
            alert('Could not start voice recognition. Please try again.')
          }
        }
      }
    } catch (error) {
      console.error('❌ Microphone permission denied:', error)
      setIsRequestingPermission(false)
      alert('Microphone access is required for voice input. Please allow microphone access in your browser settings and try again.')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      console.log('🛑 Stopping voice recognition...')
      recognitionRef.current.stop()
      setIsListening(false)
      setTranscript('')
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const playAudio = () => {
    if (audioRef.current && currentAudioUrl) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const clearConversation = () => {
    setMessages([])
    setCurrentAudioUrl(null)
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Voice AI Assistant
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Powered by OpenAI & ElevenLabs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Input Toggle */}
            {voiceSupported && (
              <button
                onClick={toggleListening}
                disabled={isLLMLoading || isRequestingPermission}
                className={`p-2 rounded-lg transition-colors ${
                  isRequestingPermission
                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 animate-pulse'
                    : isListening
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                }`}
                title={
                  isRequestingPermission 
                    ? 'Requesting microphone permission...' 
                    : isListening 
                    ? 'Stop Listening' 
                    : 'Start Voice Input'
                }
              >
                {isRequestingPermission ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Voice Output Toggle */}
            <button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                isVoiceEnabled
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
              title={isVoiceEnabled ? 'Voice Output Enabled' : 'Voice Output Disabled'}
            >
              {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <DarkModeToggle />
            
            {/* Clear Conversation Button */}
            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                title="Clear Conversation"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Hello! I'm your AI Assistant
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              I can help you with questions, creative tasks, analysis, and more. 
              {isVoiceEnabled && ' Voice responses are enabled!'}
              {voiceSupported && ' Click the microphone to use voice input.'}
            </p>
            
            {/* Microphone Permission Info */}
            {voiceSupported && (
              <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl max-w-2xl mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Voice Input Available
                  </span>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Click the microphone button to start voice input. Your browser will ask for microphone permission the first time.
                </p>
              </div>
            )}
            
            {/* Voice Status */}
            {(isListening || transcript) && (
              <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl max-w-2xl mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {isListening ? 'Listening...' : 'Processing...'}
                  </span>
                </div>
                {transcript && (
                  <p className="text-blue-800 dark:text-blue-200 italic">
                    "{transcript}"
                  </p>
                )}
              </div>
            )}
            
            {/* Quick Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
              {[
                "What's the weather like today?",
                "Help me write a professional email",
                "Explain quantum computing simply",
                "Give me a creative writing prompt"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setHasUserGesture(true) // Mark user gesture for text input
                    handleSubmit(suggestion)
                  }}
                  className="p-4 text-left rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all hover:scale-105 hover:shadow-lg"
                >
                  <span className="text-gray-900 dark:text-white font-medium">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation */
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <div className={`max-w-3xl rounded-xl p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.isError
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                    : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {(isLLMLoading || isVoiceLoading) && (
              <div className="flex justify-center">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                    {isLLMLoading ? 'Thinking...' : 'Generating voice...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Messages */}
        {(llmError || voiceError) && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-700 dark:text-red-400 font-medium">
              {llmError || voiceError}
            </p>
          </div>
        )}

        {/* Enhanced Audio Player */}
        {currentAudioUrl && (
          <div className="mt-6">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <button
                  onClick={isPlaying ? pauseAudio : playAudio}
                  className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <div className="flex-1">
                  <audio
                    ref={audioRef}
                    src={currentAudioUrl}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => {
                      setIsPlaying(false)
                      setCurrentAudioUrl(null)
                    }}
                    controls
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Input Section */}
      <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <InputBox 
            value={inputValue}
            onChange={setInputValue}
            onSubmit={(text) => {
              setHasUserGesture(true) // Mark user gesture for text input
              handleSubmit(text)
            }}
            disabled={isLLMLoading || isListening}
            placeholder={isListening ? "Listening... Speak now" : transcript ? `Processing: "${transcript}"` : "Type your message or use voice input..."}
          />
        </div>
      </div>
    </div>
  )
}

export default App
