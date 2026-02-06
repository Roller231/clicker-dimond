import { useEffect, useState, useRef, useCallback } from 'react'
import * as api from '../api/client'
import { useUser } from '../context/UserContext'
import './Chat.css'

type Props = {
  onClose: () => void
}

export default function Chat({ onClose }: Props) {
  const { user } = useUser()
  const [messages, setMessages] = useState<api.ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scrollToBottom = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [])

  const loadMessages = useCallback(async () => {
    try {
      const msgs = await api.getChatMessages(50)
      setMessages(msgs)
    } catch (e) {
      console.error('Failed to load chat', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadMessages().then(scrollToBottom)
  }, [loadMessages, scrollToBottom])

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Poll for new messages every 3 seconds
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const msgs = await api.getChatMessages(50)
        setMessages(msgs)
      } catch { /* ignore */ }
    }, 3000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const handleSend = async () => {
    if (!user || !input.trim() || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)

    try {
      const newMsg = await api.sendChatMessage(user.id, text)
      setMessages(prev => [...prev, newMsg])
    } catch (e) {
      console.error('Send failed', e)
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={e => e.stopPropagation()}>

        <div className="chat-header">
          <div className="chat-title">💬 Чат</div>
          <button className="chat-close" onClick={onClose}>✕</button>
        </div>

        <div className="chat-messages" ref={listRef}>
          {loading ? (
            <div className="chat-loading">Загрузка...</div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">Пока нет сообщений. Напиши первым!</div>
          ) : (
            messages.map(msg => {
              const isMe = msg.user_id === user?.id
              return (
                <div key={msg.id} className={`chat-msg ${isMe ? 'chat-msg-me' : 'chat-msg-other'}`}>
                  {!isMe && (
                    <div className="chat-msg-avatar">
                      {msg.url_image ? (
                        <img src={msg.url_image} alt="" className="chat-avatar-img" />
                      ) : (
                        <div className="chat-avatar-placeholder">
                          {(msg.first_name || msg.username || '?')[0]}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="chat-msg-content">
                    {!isMe && (
                      <div className="chat-msg-name">
                        {msg.username ? `@${msg.username}` : msg.first_name || 'Игрок'}
                      </div>
                    )}
                    <div className="chat-msg-bubble">
                      <div className="chat-msg-text">{msg.text}</div>
                      <div className="chat-msg-time">{formatTime(msg.created_at)}</div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="chat-input-row">
          <input
            className="chat-input"
            type="text"
            placeholder="Написать сообщение..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={500}
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || sending}
          >
            ➤
          </button>
        </div>

      </div>
    </div>
  )
}
