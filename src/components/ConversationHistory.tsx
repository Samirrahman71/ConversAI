import { useState } from 'react'
import { History, Trash2, Download, Search } from 'lucide-react'
import { Message } from '../types'

interface ConversationHistoryProps {
  messages: Message[]
  onClearHistory: () => void
  onLoadConversation: (messages: Message[]) => void
}

export function ConversationHistory({ messages, onClearHistory, onLoadConversation }: ConversationHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMessages = messages.filter(msg => 
    msg.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.response.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const exportConversation = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      messages: messages.map(msg => ({
        question: msg.question,
        response: msg.response,
        timestamp: msg.timestamp
      }))
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-conversation-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Conversation History"
      >
        <History className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation History</h2>
          <div className="flex gap-2">
            <button
              onClick={exportConversation}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Export conversation"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm('Clear all conversation history?')) {
                  onClearHistory()
                }
              }}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              title="Clear history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              {searchTerm ? 'No matching conversations found' : 'No conversations yet'}
            </p>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() => {
                  onLoadConversation([msg])
                  setIsOpen(false)
                }}
              >
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {new Date(msg.timestamp).toLocaleString()}
                </div>
                <div className="text-sm text-gray-900 dark:text-white mb-1 font-medium">
                  Q: {msg.question}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  A: {msg.response}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
