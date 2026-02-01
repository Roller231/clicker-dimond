import { useEffect, useState } from 'react'
import './Shop.css'
import { useUser } from '../context/UserContext'
import * as api from '../api/client'
import { openStarsInvoice } from '../utils/telegram'

type Props = {
  balance: number
}

export default function Shop({ balance }: Props) {
  const { handlePurchase } = useUser()
  const [shopItems, setShopItems] = useState<api.ShopItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getShopItems()
      .then(setShopItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleBuy = async (item: api.ShopItem) => {
    try {
      // Получаем реальный invoice URL с бэкенда
      const invoiceUrl = await api.createStarsInvoice(item.id)
      
      openStarsInvoice(
        invoiceUrl,
        async (paymentId) => {
          // Платёж успешен - отправляем на бэкенд
          const success = await handlePurchase(item.id, paymentId)
          if (success) {
            alert(`Успешно! +${item.crystals} 💎`)
          }
        },
        () => {
          // Платёж отменён
          console.log('Payment cancelled')
        }
      )
    } catch (error) {
      console.error('Failed to create invoice:', error)
      alert('Ошибка создания платежа. Попробуйте позже.')
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
