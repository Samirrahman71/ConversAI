import { useState, FormEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { VoiceInput } from './VoiceInput'

interface InputBoxProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function InputBox({ value, onChange, onSubmit, disabled = false, placeholder = "Type your message..." }: InputBoxProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!value.trim() || disabled) return

    setIsSubmitting(true)
    try {
      await onSubmit(value)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSubmitting}
            rows={3}
            className="input-field resize-none"
            style={{ minHeight: '60px' }}
          />
        </div>
        <div className="flex gap-2">
          <VoiceInput 
            onTranscript={(text) => onChange(text)}
            disabled={disabled || isSubmitting}
          />
          <button
            type="submit"
            disabled={!value.trim() || disabled || isSubmitting}
            className="btn-primary flex items-center gap-2 px-6 py-3 h-fit"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </form>
  )
}
