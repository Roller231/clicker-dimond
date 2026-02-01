import './Shop.css'

type Props = {
  balance: number
}

type Pack = {
  id: string
  crystals: number
  priceLabel: string
  bonusLabel?: string
}

export default function Shop({ balance }: Props) {
  const packs: Pack[] = [
    { id: 's', crystals: 100, priceLabel: '0.99 $' },
    { id: 'm', crystals: 550, priceLabel: '3.99 $', bonusLabel: '+10%' },
    { id: 'l', crystals: 1200, priceLabel: '7.99 $', bonusLabel: '+20%' },
    { id: 'xl', crystals: 2500, priceLabel: '14.99 $', bonusLabel: '+30%' },
  ]

  return (
    <div className="shop-page page-with-particles">
      <div className="page-particles" />
      <div className="shop-header">
        <div className="shop-title">Магазин</div>

        <div className="shop-balance">
          <span className="sb-emoji">💎</span>
          <span className="sb-value">{balance}</span>
        </div>
      </div>


      <div className="shop-list">
        {packs.map((p) => (
          <div className="shop-card" key={p.id}>
            <div className="sc-left">
              <div className="sc-emoji">💎</div>

              <div className="sc-text">
                <div className="sc-title">{p.crystals} кристаллов</div>
                <div className="sc-desc">
                  {p.bonusLabel ? <span className="sc-bonus">Бонус {p.bonusLabel}</span> : 'Без бонуса'}
                </div>
              </div>
            </div>

            <div className="sc-right">
              <button className="sc-buy" onClick={() => {}}>
                Купить · {p.priceLabel}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
