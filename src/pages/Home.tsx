import TopBar from '../components/TopBar'
import Diamond from '../components/Diamond'
import BottomBar from '../components/BottomBar'

import './Home.css'

type Props = {
  balance: number
  energy: number
  maxEnergy: number
  passive: number
  onBalanceChange: (clicks?: number) => void
  onOpenTop: () => void
}

export default function Home({ balance, energy, maxEnergy, passive, onBalanceChange, onOpenTop }: Props) {
  const onDiamondClick = () => {
    if (energy <= 0) return
    onBalanceChange(1)
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
