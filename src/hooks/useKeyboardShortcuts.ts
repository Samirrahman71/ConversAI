import { useEffect } from 'react'

interface KeyboardShortcutsConfig {
  onNewConversation?: () => void
  onToggleDarkMode?: () => void
  onFocusInput?: () => void
  onClearHistory?: () => void
  onToggleHistory?: () => void
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Only allow Escape to work when in input fields
        if (event.key === 'Escape') {
          target.blur()
        }
        return
      }

      // Cmd/Ctrl + K: Focus input
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        config.onFocusInput?.()
      }

      // Cmd/Ctrl + N: New conversation
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault()
        config.onNewConversation?.()
      }

      // Cmd/Ctrl + D: Toggle dark mode
      if ((event.metaKey || event.ctrlKey) && event.key === 'd') {
        event.preventDefault()
        config.onToggleDarkMode?.()
      }

      // Cmd/Ctrl + H: Toggle history
      if ((event.metaKey || event.ctrlKey) && event.key === 'h') {
        event.preventDefault()
        config.onToggleHistory?.()
      }

      // Cmd/Ctrl + Shift + Delete: Clear history
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'Backspace') {
        event.preventDefault()
        if (confirm('Clear all conversation history?')) {
          config.onClearHistory?.()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [config])

  return {
    shortcuts: [
      { key: '⌘K', description: 'Focus input' },
      { key: '⌘N', description: 'New conversation' },
      { key: '⌘D', description: 'Toggle dark mode' },
      { key: '⌘H', description: 'Toggle history' },
      { key: '⌘⇧⌫', description: 'Clear history' },
    ]
  }
}
