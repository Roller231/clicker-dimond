import { useState, useRef, useEffect } from 'react'
import './DepositModal.css'
import { useLanguage } from '../context/LanguageContext'
import { useUser } from '../context/UserContext'
import * as usersApi from '../api/users'
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { apiFetch } from '../api/client'

const DEPOSIT_CURRENCIES = [
  { id: 'ton', name: 'TON', icon: '/image/ton_symbol.svg', rate: 1 },
  { id: 'usdt', name: 'USDT', icon: '/image/usdt-icon.svg', rate: 1 },
  { id: 'stars', name: 'Stars', icon: '/image/telegram-star.svg', rate: 0.02 },
]

function DepositModal({ isOpen, onClose }) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('gifts')
  const [depositCurrency, setDepositCurrency] = useState(DEPOSIT_CURRENCIES[0])
  const [amount, setAmount] = useState('')
  
  const modalRef = useRef(null)
  const contentRef = useRef(null)
  const dragStartY = useRef(0)
  const currentTranslateY = useRef(0)
  const isDragging = useRef(false)

  const API_URL = import.meta.env.VITE_API_URL
  const { user, loading, setUser } = useUser()
  const [tonConnectUI] = useTonConnectUI()
  const tonWallet = useTonWallet()
  const [isPaying, setIsPaying] = useState(false)

  const toNano = (value) => {
    return Math.floor(Number(value) * 1e9).toString()
  }

  const handleTonPay = async () => {
    const inputAmount = Number(amount)
    if (!inputAmount || inputAmount <= 0 || isPaying) return

    const tonAmount = inputAmount * depositCurrency.rate
    setIsPaying(true)

    try {
      await apiFetch('/api/ton/create', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          amount: tonAmount,
          currency: depositCurrency.id,
          originalAmount: inputAmount
        })
      })

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
          {
            address: import.meta.env.VITE_TON_RECEIVER,
            amount: toNano(tonAmount)
          }
        ]
      })

      await apiFetch('/api/ton/success', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id })
      })

      const updatedUser = await usersApi.getUserById(user.id)
      setUser(updatedUser)
      onClose()
    } catch (e) {
      console.error('TON pay error', e)
    } finally {
      setIsPaying(false)
    }
  }

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.style.transform = 'translateY(0)'
      currentTranslateY.current = 0
      setActiveTab('gifts')
      setDepositCurrency(DEPOSIT_CURRENCIES[0])
      setAmount('')
    }
  }, [isOpen])


  const getConvertedAmount = () => {
    if (!amount || !depositCurrency) return '0'
    const numAmount = Number(amount)
    const tonValue = numAmount * depositCurrency.rate
    return tonValue.toFixed(4)
  }

  if (loading || !user) {
    return null
  }

  const handleStarsPay = async () => {
    if (!amount || Number(amount) <= 0) return
  
    try {
      const res = await fetch(`${API_URL}/api/stars/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          user_id: user.id
        })
      })
  
      if (!res.ok) {
        throw new Error('Create invoice failed')
      }
  
      const data = await res.json()
      window.Telegram.WebApp.openInvoice(data.invoice_link)
    } catch (e) {
      console.error('Stars pay error', e)
    }
  }
  
  useEffect(() => {
    const handler = async (event) => {
      if (event.status === 'paid') {
        try {
          await fetch(`${API_URL}/api/stars/success`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id })
          })
          const updatedUser = await usersApi.getUserById(user.id)
          setUser(updatedUser)
        } catch (err) {
          console.error('Stars success error', err)
        } finally {
          onClose()
        }
      }
    }
  
    window.Telegram.WebApp.onEvent('invoiceClosed', handler)
    return () => window.Telegram.WebApp.offEvent('invoiceClosed', handler)
  }, [API_URL, user.id, setUser, onClose])

  const handleDragStart = (e) => {
    isDragging.current = true
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY
    dragStartY.current = clientY - currentTranslateY.current
    if (contentRef.current) {
      contentRef.current.style.transition = 'none'
    }
  }

  const handleDragMove = (e) => {
    if (!isDragging.current) return
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY
    let newTranslateY = clientY - dragStartY.current
    if (newTranslateY < 0) newTranslateY = 0
    currentTranslateY.current = newTranslateY
    if (contentRef.current) {
      contentRef.current.style.transform = `translateY(${newTranslateY}px)`
    }
  }

  const handleDragEnd = () => {
    if (!isDragging.current) return
    isDragging.current = false
    if (contentRef.current) {
      contentRef.current.style.transition = 'transform 0.3s ease-out'
      if (currentTranslateY.current > 100) {
        contentRef.current.style.transform = 'translateY(100%)'
        setTimeout(() => {
          onClose()
          currentTranslateY.current = 0
        }, 300)
      } else {
        contentRef.current.style.transform = 'translateY(0)'
        currentTranslateY.current = 0
      }
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => handleDragMove(e)
    const handleMouseUp = () => handleDragEnd()
    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isOpen])

  const handleOverlayClick = (e) => {
    if (e.target === modalRef.current) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="deposit-modal-overlay" 
      ref={modalRef}
      onClick={handleOverlayClick}
    >
      <div 
        className="deposit-modal-content"
        ref={contentRef}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div className="deposit-modal-handle" onMouseDown={handleDragStart}>
          <div className="deposit-modal-handle-bar"></div>
        </div>

        <h2 className="deposit-modal-title">{t('deposit.title')}</h2>

        <div className="deposit-modal-tabs">
          <button 
            className={`deposit-modal-tab ${activeTab === 'gifts' ? 'active' : ''}`}
            onClick={() => setActiveTab('gifts')}
          >
            {t('deposit.gifts')}
          </button>
          <button 
            className={`deposit-modal-tab ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
          >
            {t('deposit.wallet')}
          </button>
        </div>

        <div className="deposit-modal-tabs-content">
          {/* Вкладка Звезды */}
          <div className={`deposit-tab-panel ${activeTab === 'gifts' ? 'active' : ''}`}>
            <div className="deposit-stars-content">
              <div className="deposit-input-row">
                <input
                  type="text"
                  inputMode="numeric"
                  className="deposit-amount-input"
                  placeholder={t('deposit.amount')}
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setAmount(value)
                  }}
                />
                <div className="deposit-currency-badge">
                  <img src="/image/telegram-star.svg" alt="Stars" className="deposit-badge-icon" />
                </div>
              </div>

              <button
                className="deposit-wallet-button"
                onClick={handleStarsPay}
                disabled={!amount}
              >
                {t('deposit.payStars')}
              </button>
            </div>
          </div>

          {/* Вкладка Кошелёк */}
          <div className={`deposit-tab-panel ${activeTab === 'wallet' ? 'active' : ''}`}>
            <div className="deposit-stars-content">
              <div className="deposit-input-row">
                <input
                  type="text"
                  inputMode="decimal"
                  className="deposit-amount-input"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => {
                    let value = e.target.value
                    value = value.replace(/,/g, '.')
                    value = value.replace(/[^0-9.]/g, '')
                    const parts = value.split('.')
                    if (parts.length > 2) {
                      value = parts[0] + '.' + parts.slice(1).join('')
                    }
                    setAmount(value)
                  }}
                />
                <div className="deposit-currency-badge">
                  <img src="/image/ton_symbol.svg" alt="TON" className="deposit-badge-icon" />
                </div>
              </div>

              {amount && Number(amount) > 0 && (
                <div className="deposit-conversion-info">
                  <span className="deposit-conversion-label">{t('deposit.youWillGet')}</span>
                  <span className="deposit-conversion-value">
                    ≈ {getConvertedAmount()} TON
                  </span>
                </div>
              )}

              {!tonWallet ? (
                <button
                  className="deposit-wallet-button"
                  onClick={() => tonConnectUI.openModal()}
                >
                  {t('deposit.connectWallet')}
                </button>
              ) : (
                <>
                  <div className="deposit-wallet-message">
                    {tonWallet.account.address.slice(0, 6)}...
                    {tonWallet.account.address.slice(-4)}
                  </div>
                  <button
                    className="deposit-wallet-button"
                    onClick={handleTonPay}
                    disabled={!amount || isPaying}
                  >
                    {isPaying ? t('deposit.processing') : t('deposit.payWith') + ' TON'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepositModal
