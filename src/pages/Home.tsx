import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import Diamond from '../components/Diamond'
import BottomBar from '../components/BottomBar'

import './Home.css'

type Props = {
  balance: number
  onBalanceChange: (updater: (prev: number) => number) => void
  passive: number
  clickPower: number
  maxEnergy: number
  onOpenTop: () => void
}

export default function Home({ balance, onBalanceChange, passive, clickPower, maxEnergy, onOpenTop }: Props) {
  const [energy, setEnergy] = useState<number>(maxEnergy)

  useEffect(() => {
    // keep effect subscription stable in case parent callback changes
  }, [onBalanceChange])

  useEffect(() => {
    const id = window.setInterval(() => {
      setEnergy((e) => (e >= maxEnergy ? e : e + 1))
    }, 1000)

    return () => window.clearInterval(id)
  }, [maxEnergy])

  useEffect(() => {
    setEnergy((e) => Math.min(e, maxEnergy))
  }, [maxEnergy])

  const onDiamondClick = () => {
    if (energy <= 0) return
    onBalanceChange(b => b + clickPower)
    setEnergy(e => e - 1)
  }

  return (
<div className="home page-with-particles">
  <div className="page-particles" />

  {/* САМЫЙ ВЕРХ */}
  <BottomBar energy={energy} maxEnergy={maxEnergy} passive={passive} />

  {/* БАЛАНС */}
  <div className="home-balance-row">
    <TopBar balance={balance} />
    <button className="home-top-btn" onClick={onOpenTop}>
      🏆
    </button>
  </div>

  {/* ЦЕНТР */}
  <div className="home-center">
    <Diamond onClick={onDiamondClick} />
  </div>

</div>

  )
  
}
