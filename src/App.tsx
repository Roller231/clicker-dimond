import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Exchange from './pages/Exchange'
import Tasks from './pages/Tasks'
import Upgrades from './pages/Upgrades'
import BottomNav from './components/BottomNav'

type Page = 'home' | 'upgrades' | 'shop' | 'exchange' | 'tasks'

type UpgradeKey = 'click' | 'autoclick' | 'megaclick' | 'superclick' | 'maxEnergy'

type UpgradeState = {
  level: number
  basePrice: number
}

function calcPrice(u: UpgradeState) {
  return Math.floor(u.basePrice * Math.pow(1.35, u.level))
}

function getPassivePerSecond(upgrades: Record<UpgradeKey, UpgradeState>) {
  const autoclicksPerSecond = upgrades.autoclick.level * 0.5
  const megaclicksPerSecond = upgrades.megaclick.level * 1
  const superclicksPerSecond = upgrades.superclick.level * 2
  return autoclicksPerSecond + megaclicksPerSecond + superclicksPerSecond
}

function getAutoclickIntervalsMs(upgrades: Record<UpgradeKey, UpgradeState>) {
  const intervals: number[] = []

  for (let i = 0; i < upgrades.autoclick.level; i++) intervals.push(2000)
  for (let i = 0; i < upgrades.megaclick.level; i++) intervals.push(1000)
  for (let i = 0; i < upgrades.superclick.level; i++) intervals.push(500)

  return intervals
}

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [isTopOpen, setIsTopOpen] = useState<boolean>(false)

  const [balance, setBalance] = useState<number>(0)
  const [upgrades, setUpgrades] = useState<Record<UpgradeKey, UpgradeState>>({
    click: { level: 0, basePrice: 10 },
    autoclick: { level: 0, basePrice: 25 },
    megaclick: { level: 0, basePrice: 60 },
    superclick: { level: 0, basePrice: 140 },
    maxEnergy: { level: 0, basePrice: 15 },
  })

  const passivePerSecond = getPassivePerSecond(upgrades)
  const clickPower = 1 + upgrades.click.level
  const maxEnergy = 100 + upgrades.maxEnergy.level * 25

  useEffect(() => {
    const timers: number[] = []
    const intervals = getAutoclickIntervalsMs(upgrades)

    for (const ms of intervals) {
      const id = window.setInterval(() => {
        setBalance((b) => b + 1)
      }, ms)
      timers.push(id)
    }

    return () => {
      for (const id of timers) window.clearInterval(id)
    }
  }, [upgrades.autoclick.level, upgrades.megaclick.level, upgrades.superclick.level])

  return (
    <div className="app-wrapper">
      {page === 'home' && (
        <Home
          balance={balance}
          onBalanceChange={setBalance}
          passive={passivePerSecond}
          clickPower={clickPower}
          maxEnergy={maxEnergy}
          onOpenTop={() => setIsTopOpen(true)}
        />
      )}
      {page === 'upgrades' && (
        <Upgrades
          balance={balance}
          upgrades={upgrades}
          onBuy={(key) => {
            const u = upgrades[key]
            const price = calcPrice(u)
            if (balance < price) return

            setBalance((b) => b - price)
            setUpgrades((prev) => ({
              ...prev,
              [key]: { ...prev[key], level: prev[key].level + 1 },
            }))
          }}
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
              {[
                { name: 'Player_01', amount: 125000 },
                { name: 'Player_02', amount: 98000 },
                { name: 'Player_03', amount: 76500 },
                { name: 'Player_04', amount: 52000 },
                { name: 'Player_05', amount: 41000 },
                { name: 'Player_06', amount: 38000 },
                { name: 'Player_07', amount: 31000 },
                { name: 'Player_08', amount: 27000 },
                { name: 'Player_09', amount: 22000 },
                { name: 'Player_10', amount: 18000 },
              ].map((p, idx) => (
                <div className="leaderboard-item" key={p.name}>
                  <div className="lb-rank">#{idx + 1}</div>
                  <div className="lb-name">{p.name}</div>
                  <div className="lb-amount">{p.amount} 💎</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
