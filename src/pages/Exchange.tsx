import { useState, useEffect } from 'react'
import './Exchange.css'
import { useUser } from '../context/UserContext'
import * as api from '../api/client'

type Props = {
  balance: number
}

export default function Exchange({ balance }: Props) {
  const { user, handleTransfer, refreshUser } = useUser()
  const [receiver, setReceiver] = useState('')
  const [amount, setAmount] = useState('')
  const [history, setHistory] = useState<api.TransferHistory[]>([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (user) {
      api.getTransferHistory(user.id, 10)
        .then(setHistory)
        .catch(console.error)
    }
  }, [user])

  const handleSend = async () => {
    if (!receiver || !amount || sending) return
    
    const amountNum = parseInt(amount, 10)
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Введите корректную сумму')
      return
    }

    if (amountNum > balance) {
      alert('Недостаточно кристаллов')
      return
    }

    setSending(true)
    try {
      const success = await handleTransfer(receiver.replace('@', ''), amountNum)
      if (success) {
        alert(`Успешно отправлено ${amountNum} 💎`)
        setReceiver('')
        setAmount('')
        await refreshUser()
        if (user) {
          const newHistory = await api.getTransferHistory(user.id, 10)
          setHistory(newHistory)
        }
      } else {
        alert('Ошибка перевода. Проверьте получателя.')
      }
    } catch {
      alert('Ошибка перевода')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="exchange-page page-with-particles">
      <div className="page-particles" />
      <div className="exchange-header">
        <div className="exchange-title">Обмен</div>

        <div className="exchange-balance">
          <span className="eb-emoji">💎</span>
          <span className="eb-value">{balance}</span>
        </div>
      </div>

      <div className="exchange-scroll">
        <div className="exchange-center">
          <div className="exchange-block">
            <div className="xb-title">Перевод другу</div>
            <div className="xb-desc">По юзернейму</div>

            <div className="xb-form">
              <div className="xb-field">
                <div className="xb-label">Получатель</div>
                <input
                  className="xb-input"
                  placeholder="@username"
                  inputMode="text"
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                />
              </div>

              <div className="xb-field">
                <div className="xb-label">Сумма</div>
                <div className="xb-amount">
                  <input
                    className="xb-input xb-input-amount"
                    placeholder="0"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                  />
                  <div className="xb-suffix">💎</div>
                </div>
              </div>

              <button 
                className={`xb-action ${sending ? 'disabled' : ''}`} 
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </div>
        </div>

        <div className="exchange-block small">
          <div className="xb-title">История</div>
          <div className="xb-desc">Последние переводы</div>

          {history.length > 0 ? (
            <div className="xb-history">
              {history.map((h) => (
                <div className="xb-history-item" key={h.id}>
                  <div className="xb-hi-dir">{h.direction === 'sent' ? '↑' : '↓'}</div>
                  <div className="xb-hi-info">
                    <div className="xb-hi-user">{h.other_username || `User #${h.other_user_id}`}</div>
                    <div className="xb-hi-date">{new Date(h.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className={`xb-hi-amount ${h.direction}`}>
                    {h.direction === 'sent' ? '-' : '+'}{h.amount} 💎
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="xb-empty">Пусто</div>
          )}
        </div>
      </div>
    </div>
  )
}
