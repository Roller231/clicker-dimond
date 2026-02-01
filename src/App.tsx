import { useEffect, useState } from 'react'
import { initTelegram } from './telegram'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Exchange from './pages/Exchange'
import Tasks from './pages/Tasks'
import Upgrades from './pages/Upgrades'
import BottomNav from './components/BottomNav'
import { useUser } from './context/UserContext'
import { getCurrentUser } from './utils/telegram'
import * as api from './api/client'

type Page = 'home' | 'upgrades' | 'shop' | 'exchange' | 'tasks'

export default function App() {
  const { user, upgrades, isLoading, error, initUser, handleClick, handlePassiveIncome, handleBuyUpgrade, getPassiveIncome, getMaxEnergy } = useUser()
  
  const [page, setPage] = useState<Page>('home')
  const [isTopOpen, setIsTopOpen] = useState<boolean>(false)
  const [leaderboard, setLeaderboard] = useState<api.User[]>([])

  // Initialize Telegram fullscreen
  useEffect(() => {
    initTelegram()
  }, [])

  // Initialize user on mount
  useEffect(() => {
    const tgUser = getCurrentUser()
    initUser(tgUser.id, tgUser.username, tgUser.firstName, tgUser.lastName, tgUser.photoUrl)
  }, [initUser])

  // Load leaderboard when modal opens
  useEffect(() => {
    if (isTopOpen) {
      api.getLeaderboard(10).then(setLeaderboard).catch(console.error)
    }
  }, [isTopOpen])

  // Autoclick timers based on upgrades (passive income - doesn't consume energy)
  useEffect(() => {
    if (!user) return

    const timers: number[] = []
    
    const autoclickLevel = upgrades.find(u => u.key === 'autoclick')?.level ?? 0
    const megaclickLevel = upgrades.find(u => u.key === 'megaclick')?.level ?? 0
    const superclickLevel = upgrades.find(u => u.key === 'superclick')?.level ?? 0

    for (let i = 0; i < autoclickLevel; i++) {
      const id = window.setInterval(() => handlePassiveIncome(1), 2000)
      timers.push(id)
    }
    for (let i = 0; i < megaclickLevel; i++) {
      const id = window.setInterval(() => handlePassiveIncome(1), 1000)
      timers.push(id)
    }
    for (let i = 0; i < superclickLevel; i++) {
      const id = window.setInterval(() => handlePassiveIncome(1), 500)
      timers.push(id)
    }

    return () => {
      for (const id of timers) window.clearInterval(id)
    }
  }, [user, upgrades, handlePassiveIncome])

  // Periodic energy refresh from server (every 5 seconds)
  const { refreshUser: refreshUserFn } = useUser()
  useEffect(() => {
    if (!user) return
    
    const id = window.setInterval(() => {
      refreshUserFn()
    }, 5000)

    return () => window.clearInterval(id)
  }, [user, refreshUserFn])

  // Show loading screen
  if (isLoading) {
    return (
      <div className="app-wrapper">
        <div className="loading-screen">
          <div className="loading-spinner">💎</div>
          <div className="loading-text">Загрузка...</div>
        </div>
      </div>
    )
  }

  // Show error screen
  if (error || !user) {
    return (
      <div className="app-wrapper">
        <div className="error-screen">
          <div className="error-icon">❌</div>
          <div className="error-text">{error || 'Не удалось загрузить данные'}</div>
        </div>
      </div>
    )
  }

  const balance = user.balance
  const energy = user.energy
  const passivePerSecond = getPassiveIncome()
  const maxEnergy = getMaxEnergy()

  return (
    <div className="app-wrapper">
      {page === 'home' && (
        <Home
          balance={balance}
          energy={energy}
          maxEnergy={maxEnergy}
          passive={passivePerSecond}
          onBalanceChange={handleClick}
          onOpenTop={() => setIsTopOpen(true)}
        />
      )}
      {page === 'upgrades' && (
        <Upgrades
          balance={balance}
          upgrades={upgrades}
          onBuy={handleBuyUpgrade}
        />
      )}

      {page === 'shop' && <Shop balance={balance} />}

      {page === 'exchange' && <Exchange balance={balance} />}

      {page === 'tasks' && <Tasks balance={balance} />}

      <BottomNav active={page} onChange={setPage} />

      {isTopOpen && (
        <div className="leaderboard-overlay" onClick={() => setIsTopOpen(false)}>
          <div className="leaderboard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="leaderboard-head">
              <div className="leaderboard-title">Топ игроков</div>
              <button className="leaderboard-close" onClick={() => setIsTopOpen(false)}>
                ✕
              </button>
            </div>

            <div className="leaderboard-list">
              {leaderboard.length > 0 ? leaderboard.map((p, idx) => (
                <div className="leaderboard-item" key={p.id}>
                  <div className="lb-rank">#{idx + 1}</div>
                  <div className="lb-name">{p.username || p.first_name || `User ${p.id}`}</div>
                  <div className="lb-amount">{p.balance} 💎</div>
                </div>
              )) : (
                <div className="leaderboard-empty">Нет данных</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
