import { useEffect, useState, useRef } from 'react'
import './Shop.css'
import { useUser } from '../context/UserContext'
import * as api from '../api/client'

const API_BASE = 'http://localhost:8000'

type Props = {
  balance: number
}

export default function Shop({ balance }: Props) {
  const { user, refreshUser } = useUser()
  const [shopItems, setShopItems] = useState<api.ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const currentItemRef = useRef<api.ShopItem | null>(null)

  useEffect(() => {
    api.getShopItems()
      .then(setShopItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Слушаем событие invoiceClosed от Telegram
  useEffect(() => {
    if (!user) return

    const handler = async (event: unknown) => {
      const invoiceEvent = event as { status: string }
      if (invoiceEvent.status === 'paid') {
        try {
          await fetch(`${API_BASE}/stars/success`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id })
          })
          await refreshUser()
          alert(`Успешно! +${currentItemRef.current?.crystals || 0} 💎`)
        } catch (err) {
          console.error('Stars success error', err)
        } finally {
          setBuying(false)
          currentItemRef.current = null
        }
      } else {
        setBuying(false)
        currentItemRef.current = null
      }
    }

    window.Telegram?.WebApp?.onEvent?.('invoiceClosed', handler)
    return () => {
      window.Telegram?.WebApp?.offEvent?.('invoiceClosed', handler)
    }
  }, [user, refreshUser])

  const handleBuy = async (item: api.ShopItem) => {
    if (!user || buying) return
    setBuying(true)
    currentItemRef.current = item

    try {
      const res = await fetch(`${API_BASE}/stars/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_item_id: item.id,
          user_id: user.id
        })
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(error.detail || 'Create invoice failed')
      }

      const data = await res.json()
      
      // Открываем invoice в Telegram
      if (window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(data.invoice_link)
      } else {
        // Для локального тестирования - сразу подтверждаем
        console.log('Local test: simulating payment')
        await fetch(`${API_BASE}/stars/success`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        })
        await refreshUser()
        alert(`Успешно! +${item.crystals} 💎`)
        setBuying(false)
        currentItemRef.current = null
      }
    } catch (error) {
      console.error('Failed to create invoice:', error)
      alert('Ошибка создания платежа. Попробуйте позже.')
      setBuying(false)
      currentItemRef.current = null
    }
  }

  return (
    <div className="shop-page page-with-particles">
      <div className="page-particles" />
      <div className="shop-header">
        <div className="shop-title">Магазин</div>

        <div className="shop-balance">
          <span className="sb-emoji">💎</span>
          <span className="sb-value">{balance}</span>
        </div>
      </div>

      <div className="shop-list">
        {loading ? (
          <div className="shop-loading">Загрузка...</div>
        ) : shopItems.map((item) => (
          <div className="shop-card" key={item.id}>
            <div className="sc-left">
              <div className="sc-emoji">💎</div>

              <div className="sc-text">
                <div className="sc-title">{item.crystals} кристаллов</div>
                <div className="sc-desc">
                  <span className="sc-stars">⭐ {item.stars} звёзд</span>
                </div>
              </div>
            </div>

            <div className="sc-right">
              <button className="sc-buy" onClick={() => handleBuy(item)}>
                Купить · ⭐{item.stars}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
