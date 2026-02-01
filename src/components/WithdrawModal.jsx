import { useState, useRef, useEffect, useMemo } from 'react'
import './WithdrawModal.css'
import { useLanguage } from '../context/LanguageContext'
import { useUser } from '../context/UserContext'
import { useCurrency } from '../context/CurrencyContext'
import { createTonWithdraw, createDropWithdraw } from '../api/withdraw'
import { getUserById } from '../api/users'
import { getDropById } from '../api/cases'

// Валюты для вывода - только TON и Stars (курсы берутся из бэкенда)
const WITHDRAW_CURRENCY_IDS = ['coins', 'stars']

function WithdrawModal({ isOpen, onClose }) {
  const { t } = useLanguage()
  const { user, setUser } = useUser()
  const { selectedCurrency, currencyOptions } = useCurrency()

  // Фильтруем только доступные для вывода валюты из currencyOptions (данные из бэкенда)
  const withdrawCurrencies = useMemo(() => {
    return currencyOptions.filter(c => WITHDRAW_CURRENCY_IDS.includes(c.id))
  }, [currencyOptions])

  const [activeTab, setActiveTab] = useState('coins')
  const [amount, setAmount] = useState('')
  const [selectedGift, setSelectedGift] = useState(null)
  const [withdrawCurrency, setWithdrawCurrency] = useState(null)
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false)

  // Инициализируем выбранную валюту когда загрузятся данные
  useEffect(() => {
    if (withdrawCurrencies.length > 0 && !withdrawCurrency) {
      setWithdrawCurrency(withdrawCurrencies[0])
    }
  }, [withdrawCurrencies])

  const modalRef = useRef(null)
  const contentRef = useRef(null)
  const dragStartY = useRef(0)
  const currentTranslateY = useRef(0)
  const isDragging = useRef(false)

  const [dropsMap, setDropsMap] = useState({})

  /* ================= LOAD DROPS ================= */
  useEffect(() => {
    if (!isOpen || !user?.inventory?.length) return

    let cancelled = false

    const loadDrops = async () => {
      const result = {}
      for (const inv of user.inventory) {
        try {
          const drop = await getDropById(inv.drop_id)
          result[inv.drop_id] = drop
        } catch {}
      }
      if (!cancelled) setDropsMap(result)
    }

    loadDrops()
    return () => (cancelled = true)
  }, [isOpen, user])

  const inventoryGifts = useMemo(() => {
    if (!user?.inventory?.length) return []
    return user.inventory
      .map(inv => {
        const drop = dropsMap[inv.drop_id]
        if (!drop || inv.count <= 0) return null
        return { ...drop, count: inv.count }
      })
      .filter(Boolean)
  }, [user, dropsMap])

  /* ================= REFRESH USER ================= */
  const refreshUser = async () => {
    const fresh = await getUserById(user.id)
    setUser(fresh)
  }

  /* ================= BALANCE CONVERSION ================= */
  const userBalance = Number(user?.balance) || 0
  
  const isNoDecimalCurrency = withdrawCurrency?.id === 'stars'
  
  const getConvertedBalance = () => {
    if (!withdrawCurrency?.rate) return '0'
    const converted = userBalance / withdrawCurrency.rate
    if (isNoDecimalCurrency) {
      return Math.floor(converted).toLocaleString('ru-RU').replace(/\u00A0/g, ' ')
    }
    return converted.toFixed(2)
  }

  const getMaxAmount = () => {
    if (!withdrawCurrency?.rate) return 0
    return userBalance / withdrawCurrency.rate
  }

  const handleSetMax = () => {
    const max = getMaxAmount()
    if (isNoDecimalCurrency) {
      setAmount(Math.floor(max).toString())
    } else {
      setAmount(max.toFixed(2))
    }
  }

  const handleCurrencySelect = (currency) => {
    setWithdrawCurrency(currency)
    setIsCurrencyDropdownOpen(false)
    setAmount('')
  }
  
  // Название валюты для отображения
  const getCurrencyDisplayName = (currency) => {
    if (!currency) return ''
    if (currency.id === 'coins') return 'TON'
    if (currency.id === 'stars') return 'Stars'
    return currency.id.toUpperCase()
  }

  /* ================= TON ================= */
  const handleCoinsWithdraw = async () => {
    const value = Number(amount)
    if (!value || value <= 0) return

    const tonAmount = value * withdrawCurrency.rate

    await createTonWithdraw({
      userId: user.id,
      amount: tonAmount,
      currency: withdrawCurrency.id,
    })

    await refreshUser()
    onClose()
  }

  /* ================= GIFTS ================= */
  const handleGiftWithdraw = async () => {
    if (!selectedGift) return

    await createDropWithdraw({
      userId: user.id,
      dropId: selectedGift,
    })

    await refreshUser()
    onClose()
  }

  /* ================= DRAG ================= */
  const handleDragStart = (e) => {
    isDragging.current = true
    const y = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY
    dragStartY.current = y - currentTranslateY.current
    if (contentRef.current) {
      contentRef.current.style.transition = 'none'
    }
  }

  const handleDragMove = (e) => {
    if (!isDragging.current) return
    const y = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY
    const delta = Math.max(0, y - dragStartY.current)
    currentTranslateY.current = delta
    if (contentRef.current) {
      contentRef.current.style.transform = `translateY(${delta}px)`
    }
  }

  const handleDragEnd = () => {
    if (!isDragging.current) return
    isDragging.current = false
    
    if (contentRef.current) {
      contentRef.current.style.transition = 'transform 0.3s ease'

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

  // Обработчики для mouse events на document
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

  // Сброс позиции при открытии
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.style.transform = 'translateY(0)'
      currentTranslateY.current = 0
    }
  }, [isOpen])

  // Обработка клавиатуры - поднимаем модалку когда клавиатура открыта
  useEffect(() => {
    if (!isOpen) return

    const handleResize = () => {
      if (!contentRef.current) return
      
      const viewport = window.visualViewport
      if (viewport) {
        const keyboardHeight = window.innerHeight - viewport.height
        if (keyboardHeight > 100) {
          // Клавиатура открыта - поднимаем модалку
          contentRef.current.style.transform = `translateY(-${keyboardHeight}px)`
        } else {
          // Клавиатура закрыта
          contentRef.current.style.transform = 'translateY(0)'
        }
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      window.visualViewport.addEventListener('scroll', handleResize)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
        window.visualViewport.removeEventListener('scroll', handleResize)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="withdraw-modal-overlay"
      ref={modalRef}
      onClick={(e) => e.target === modalRef.current && onClose()}
    >
      <div
        className="withdraw-modal-content"
        ref={contentRef}
      >
        <div 
          className="withdraw-modal-handle" 
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="withdraw-modal-handle-bar" />
        </div>

        <h2 className="withdraw-modal-title">{t('withdraw.title')}</h2>

        {/* TABS */}
        <div className="withdraw-modal-tabs">
          <button
            className={`withdraw-modal-tab ${activeTab === 'coins' ? 'active' : ''}`}
            onClick={() => setActiveTab('coins')}
          >
            {getCurrencyDisplayName(withdrawCurrency) || 'TON'}
          </button>
          <button
            className={`withdraw-modal-tab ${activeTab === 'gifts' ? 'active' : ''}`}
            onClick={() => setActiveTab('gifts')}
          >
            {t('withdraw.gifts')}
          </button>
        </div>

        {/* COINS */}
        {activeTab === 'coins' && withdrawCurrency && (
          <div className="withdraw-coins">
            {/* Balance Row с компактным селектором валюты */}
            <div className="withdraw-balance-row">
              <div className="withdraw-balance-info-compact">
                <span className="withdraw-balance-label">{t('withdraw.availableBalance')}</span>
                <span className="withdraw-balance-value-compact">
                  {getConvertedBalance()}
                  <img 
                    src={withdrawCurrency.icon} 
                    alt={getCurrencyDisplayName(withdrawCurrency)} 
                    className="withdraw-balance-icon-small"
                  />
                </span>
              </div>
              
              {/* Compact Currency Selector */}
              <div className="withdraw-currency-selector-compact">
                <div 
                  className="withdraw-currency-btn"
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                >
                  <img 
                    src={withdrawCurrency.icon} 
                    alt={getCurrencyDisplayName(withdrawCurrency)} 
                    className="withdraw-currency-icon-small"
                  />
                  <span className="withdraw-currency-name-small">{getCurrencyDisplayName(withdrawCurrency)}</span>
                  <svg 
                    className={`withdraw-currency-arrow-small ${isCurrencyDropdownOpen ? 'open' : ''}`}
                    width="10" 
                    height="10" 
                    viewBox="0 0 12 12"
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </div>
                
                {isCurrencyDropdownOpen && (
                  <div className="withdraw-currency-dropdown-compact">
                    {withdrawCurrencies.map((currency) => (
                      <div
                        key={currency.id}
                        className={`withdraw-currency-option-compact ${withdrawCurrency.id === currency.id ? 'active' : ''}`}
                        onClick={() => handleCurrencySelect(currency)}
                      >
                        <img 
                          src={currency.icon} 
                          alt={getCurrencyDisplayName(currency)} 
                          className="withdraw-currency-icon-small"
                        />
                        <span className="withdraw-currency-name-small">{getCurrencyDisplayName(currency)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Amount Input */}
            <div className="withdraw-amount-wrapper">
              <input
                className="withdraw-amount-input"
                type="text"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  let value = e.target.value
                  value = value.replace(/,/g, '.')
                  if (isNoDecimalCurrency) {
                    value = value.replace(/[^0-9]/g, '')
                  } else {
                    value = value.replace(/[^0-9.]/g, '')
                    const parts = value.split('.')
                    if (parts.length > 2) {
                      value = parts[0] + '.' + parts.slice(1).join('')
                    }
                  }
                  setAmount(value)
                }}
              />
              <button 
                className="withdraw-max-button"
                onClick={handleSetMax}
              >
                MAX
              </button>
            </div>

            <button
              className="withdraw-submit-button"
              onClick={handleCoinsWithdraw}
              disabled={!amount || Number(amount) <= 0 || Number(amount) > getMaxAmount()}
            >
              {t('withdraw.withdrawButton')}
            </button>
          </div>
        )}

        {/* GIFTS */}
        {activeTab === 'gifts' && (
          <>
            <div className="withdraw-gifts-grid">
              {inventoryGifts.map(g => (
                <div
                  key={g.id}
                  className={`withdraw-gift ${selectedGift === g.id ? 'selected' : ''}`}
                  onClick={() => setSelectedGift(g.id)}
                >
                  <img src={g.icon} alt={g.name} />
                  <span className="withdraw-gift-price">
                    {g.price}
                    <img src={selectedCurrency?.icon || '/image/Coin-Icon.svg'} alt="currency" className="withdraw-gift-currency-icon" />
                  </span>
                </div>
              ))}
            </div>

            <button
              className="withdraw-submit-button"
              onClick={handleGiftWithdraw}
              disabled={!selectedGift}
            >
              {t('withdraw.withdrawButton')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default WithdrawModal
