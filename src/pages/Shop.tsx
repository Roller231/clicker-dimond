import { useEffect, useState, useRef } from 'react'
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react'
import './Shop.css'
import { useUser } from '../context/UserContext'
import * as api from '../api/client'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TON_WALLET = 'UQA2ObMyh233b2ES8aSj7-T6oaeoETELdws9lBwm-i66hKEv'

type Props = {
  balance: number
}

export default function Shop({ balance }: Props) {
  const { user, refreshUser } = useUser()
  const [tonConnectUI] = useTonConnectUI()
  const walletAddress = useTonAddress()

  const [shopItems, setShopItems] = useState<api.ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [successEffect, setSuccessEffect] = useState<number | null>(null)
  const currentItemRef = useRef<api.ShopItem | null>(null)

  useEffect(() => {
    api.getShopItems()
      .then(setShopItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Слушаем событие invoiceClosed от Telegram (для Stars)
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
          setSuccessEffect(currentItemRef.current?.crystals || 0)
          setTimeout(() => setSuccessEffect(null), 2000)
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

  // ─── Покупка за Stars ───
  const handleBuyStars = async (item: api.ShopItem) => {
    if (!user || buying) return
    setBuying(true)
    currentItemRef.current = item

    try {
      const res = await fetch(`${API_BASE}/stars/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_item_id: item.id, user_id: user.id })
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(error.detail || 'Create invoice failed')
      }

      const data = await res.json()

      if (window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(data.invoice_link)
      } else {
        console.log('Local test: simulating payment')
        await fetch(`${API_BASE}/stars/success`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        })
        await refreshUser()
        setSuccessEffect(item.crystals)
        setTimeout(() => setSuccessEffect(null), 2000)
        setBuying(false)
        currentItemRef.current = null
      }
    } catch (error) {
      console.error('Failed to create invoice:', error)
      setBuying(false)
      currentItemRef.current = null
    }
  }

  // ─── Покупка за TON ───
  const handleBuyTon = async (item: api.ShopItem) => {
    if (!user || buying || !item.ton_price) return

    // Если кошелёк не подключен — открываем подключение
    if (!walletAddress) {
      try {
        await tonConnectUI.openModal()
      } catch (e) {
        console.error('Wallet connect cancelled', e)
      }
      return
    }

    setBuying(true)
    currentItemRef.current = item

    try {
      // Конвертируем TON в нанотоны (1 TON = 10^9 nanoTON)
      const nanotons = Math.floor(item.ton_price * 1_000_000_000).toString()

      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут
        messages: [
          {
            address: TON_WALLET,
            amount: nanotons,
          }
        ]
      }

      const result = await tonConnectUI.sendTransaction(tx)

      // Транзакция отправлена — подтверждаем на бэкенде
      const res = await fetch(`${API_BASE}/stars/ton-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          shop_item_id: item.id,
          boc: result.boc,
        })
      })

      if (!res.ok) {
        throw new Error('TON confirm failed')
      }

      await refreshUser()
      setSuccessEffect(item.crystals)
      setTimeout(() => setSuccessEffect(null), 2000)
    } catch (error) {
      console.error('TON payment failed:', error)
    } finally {
      setBuying(false)
      currentItemRef.current = null
    }
  }

  return (
    <div className="shop-page page-with-particles">
      {successEffect !== null && (
        <div className="success-overlay">
          <div className="success-content">
            <div className="success-emoji">💎</div>
            <div className="success-text">+{successEffect}</div>
          </div>
        </div>
      )}
      <div className="page-particles" />
      <div className="shop-header">
        <div className="shop-title">Магазин</div>

        <div className="shop-balance">
          <span className="sb-emoji">💎</span>
          <span className="sb-value">{balance}</span>
        </div>
      </div>

      {walletAddress && (
        <div className="shop-wallet-badge">
          <span className="wallet-dot" />
          <span className="wallet-addr">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
        </div>
      )}

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
                  {item.ton_price && (
                    <span className="sc-ton"> · 💎 {item.ton_price} TON</span>
                  )}
                </div>
              </div>
            </div>

            <div className="sc-right">
              <button className="sc-buy" onClick={() => handleBuyStars(item)} disabled={buying}>
                ⭐ {item.stars}
              </button>
              {item.ton_price && (
                <button className="sc-buy sc-buy-ton" onClick={() => handleBuyTon(item)} disabled={buying}>
                  💎 {item.ton_price} TON
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}