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
    </div>
  )
}
