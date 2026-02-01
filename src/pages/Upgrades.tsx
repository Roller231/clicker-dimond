import './Upgrades.css'
import type { UpgradeData } from '../context/UserContext'

type Props = {
  balance: number
  upgrades: UpgradeData[]
  onBuy: (key: string) => Promise<boolean>
}

const upgradesMeta: Record<string, { desc: string; emoji: string }> = {
  click: { desc: '+1 к доходу за клик', emoji: '👆' },
  autoclick: { desc: 'Кликает сам раз в 2 сек', emoji: '🤖' },
  megaclick: { desc: 'Кликает сам раз в 1 сек', emoji: '🦾' },
  superclick: { desc: 'Кликает сам раз в 0.5 сек', emoji: '🔥' },
  maxEnergy: { desc: 'Увеличивает запас энергии', emoji: '⚡' },
}

export default function Upgrades({ balance, upgrades, onBuy }: Props) {
  return (
    <div className="upgrades-page page-with-particles">
      <div className="page-particles" />
      <div className="upgrades-header">
        <div className="upgrades-title">Улучшения</div>

        <div className="upgrades-balance">
          <span className="ub-emoji">💎</span>
          <span className="ub-value">{balance}</span>
        </div>
      </div>

      <div className="upgrades-list">
        {upgrades.map((u) => {
          const meta = upgradesMeta[u.key] || { desc: '', emoji: '📦' }
          const canBuy = balance >= u.nextPrice

          return (
            <div className="upgrade-card" key={u.key}>
              <div className="uc-left">
                <div className="uc-emoji">{meta.emoji}</div>

                <div className="uc-text">
                  <div className="uc-title">{u.title}</div>
                  <div className="uc-desc">{meta.desc}</div>
                </div>
              </div>

              <div className="uc-right">
                <div className="uc-level">Уровень {u.level}</div>

                <button
                  className={`uc-buy ${canBuy ? '' : 'disabled'}`}
                  onClick={() => canBuy && onBuy(u.key)}
                >
                  Купить · {u.nextPrice} 💎
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
