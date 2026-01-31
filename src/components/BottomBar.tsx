import './BottomBar.css'

type Props = {
  energy: number
  passive: number
}

export default function BottomBar({ energy, passive }: Props) {
  return (
    <div className="stats-bar">
      <div className="stat-card energy">
        <div className="stat-icon">⚡</div>
        <div className="stat-info">
          <div className="stat-title">Энергия</div>
          <div className="stat-value">{energy} / 100</div>
        </div>
      </div>

      <div className="stat-card passive">
        <div className="stat-icon">🪙</div>
        <div className="stat-info">
          <div className="stat-title">Пассив</div>
          <div className="stat-value">+{passive} / сек</div>
        </div>
      </div>
    </div>
  )
}
