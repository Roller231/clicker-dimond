import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import Diamond from '../components/Diamond'
import BottomBar from '../components/BottomBar'

import './Home.css'

export default function Home() {
  const [balance, setBalance] = useState<number>(0)
  const [energy, setEnergy] = useState<number>(100)
  const [passive] = useState<number>(2)

  useEffect(() => {
    const interval = setInterval(() => {
      setBalance(b => b + passive)
    }, 1000)

    return () => clearInterval(interval)
  }, [passive])

  const onDiamondClick = () => {
    if (energy <= 0) return
    setBalance(b => b + 1)
    setEnergy(e => e - 1)
  }

  return (
<div className="home">
  <div className="home-particles" />

  {/* САМЫЙ ВЕРХ */}
  <BottomBar energy={energy} passive={passive} />

  {/* БАЛАНС */}
  <TopBar balance={balance} />

  {/* ЦЕНТР */}
  <div className="home-center">
    <Diamond onClick={onDiamondClick} />
  </div>

</div>

  )
  
}
