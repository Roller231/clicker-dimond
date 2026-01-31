import { useState } from 'react'
import Home from './pages/Home'
import Upgrades from './pages/Upgrades'
import BottomNav from './components/BottomNav'

type Page = 'home' | 'upgrades' | 'shop' | 'exchange' | 'tasks'

export default function App() {
  const [page, setPage] = useState<Page>('home')

  return (
    <div className="app-wrapper">
      {page === 'home' && <Home />}
      {page === 'upgrades' && (
        <Upgrades
          balance={1234}
          upgrades={{
            click: { level: 1, basePrice: 10 },
            autoclick: { level: 0, basePrice: 25 },
            maxEnergy: { level: 2, basePrice: 15 },
          }}
          onBuy={(k) => console.log('buy', k)}
        />
      )}

      <BottomNav active={page} onChange={setPage} />
    </div>
  )
}
