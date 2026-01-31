import './Upgrades.css'

type UpgradeKey = 'click' | 'autoclick' | 'maxEnergy'

type UpgradeState = {
  level: number
  basePrice: number
}

type Props = {
  balance: number
  upgrades: Record<UpgradeKey, UpgradeState>
  onBuy: (key: UpgradeKey) => void
}

function calcPrice(u: UpgradeState) {
  // простая формула роста цены
  return Math.floor(u.basePrice * Math.pow(1.35, u.level))
}

export default function Upgrades({ balance, upgrades, onBuy }: Props) {
  const items: Array<{
    key: UpgradeKey
    title: string
    desc: string
    emoji: string
  }> = [
    { key: 'click', title: 'Клик', desc: '+1 к доходу за клик', emoji: '👆' },
    { key: 'autoclick', title: 'Автоклик', desc: 'Кликает сам раз в сек', emoji: '🤖' },
    { key: 'maxEnergy', title: 'Макс. энергия', desc: 'Увеличивает запас энергии', emoji: '⚡' },
  ]

  return (
    <div className="upgrades-page">
      <div className="upgrades-header">
        <div className="upgrades-title">Улучшения</div>

        <div className="upgrades-balance">
          <span className="ub-emoji">💎</span>
          <span className="ub-value">{balance}</span>
        </div>
      </div>

      <div className="upgrades-list">
        {items.map((it) => {
          const u = upgrades[it.key]
          const price = calcPrice(u)

          const canBuy = balance >= price

          return (
            <div className="upgrade-card" key={it.key}>
              <div className="uc-left">
                <div className="uc-emoji">{it.emoji}</div>

                <div className="uc-text">
                  <div className="uc-title">{it.title}</div>
                  <div className="uc-desc">{it.desc}</div>
                </div>
              </div>

              <div className="uc-right">
                <div className="uc-level">Уровень {u.level}</div>

                <button
                  className={`uc-buy ${canBuy ? '' : 'disabled'}`}
                  onClick={() => canBuy && onBuy(it.key)}
                >
                  Купить · {price} 💎
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
