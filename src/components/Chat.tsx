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
  const [toast, setToast] = useState<string | null>(null)
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

  const showToast = useCallback((text: string) => {
    setToast(text)
    window.setTimeout(() => setToast(null), 1400)
  }, [])

  const openOrCopyProfile = useCallback(async (username: string | null) => {
    if (!username) {
      showToast('У пользователя нет username')
      return
    }

    const clean = username.replace(/^@/, '').trim()
    if (!clean) {
      showToast('У пользователя нет username')
      return
    }

    const link = `https://t.me/${clean}`

    try {
      const tg = (window as any).Telegram?.WebApp
      if (tg?.openTelegramLink) {
        tg.openTelegramLink(link)
        return
      }
      if (tg?.openLink) {
        tg.openLink(link)
        return
      }

      window.open(link, '_blank', 'noopener,noreferrer')
      return
    } catch {
      // ignore and fallback to copy
    }

    try {
      await navigator.clipboard.writeText(`@${clean}`)
      showToast('Скопировано')
    } catch {
      showToast('Не удалось открыть/скопировать')
    }
  }, [showToast])

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={e => e.stopPropagation()}>

        <div className="chat-header">
          <div className="chat-title">💬 Чат</div>
          <button className="chat-close" onClick={onClose}>✕</button>
        </div>

        <div className="chat-messages" ref={listRef}>
          {toast && <div className="chat-toast">{toast}</div>}
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
                    <button
                      type="button"
                      className="chat-msg-avatar chat-profile-link"
                      onClick={() => openOrCopyProfile(msg.username)}
                      aria-label={msg.username ? `Открыть профиль @${msg.username}` : 'Открыть профиль'}
                    >
                      {msg.url_image ? (
                        <img src={msg.url_image} alt="" className="chat-avatar-img" />
                      ) : (
                        <div className="chat-avatar-placeholder">
                          {(msg.first_name || msg.username || '?')[0]}
                        </div>
                      )}
                    </button>
                  )}
                  <div className="chat-msg-content">
                    {!isMe && (
                      <button
                        type="button"
                        className="chat-msg-name chat-profile-link"
                        onClick={() => openOrCopyProfile(msg.username)}
                      >
                        {msg.username ? `@${msg.username}` : msg.first_name || 'Игрок'}
                      </button>
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
