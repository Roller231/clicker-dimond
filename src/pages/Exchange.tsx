import './Exchange.css'

type Props = {
  balance: number
}

export default function Exchange({ balance }: Props) {
  return (
    <div className="exchange-page page-with-particles">
      <div className="page-particles" />
      <div className="exchange-header">
        <div className="exchange-title">Обмен</div>

        <div className="exchange-balance">
          <span className="eb-emoji">💎</span>
          <span className="eb-value">{balance}</span>
        </div>
      </div>

      <div className="exchange-scroll">
        <div className="exchange-center">
          <div className="exchange-block">
            <div className="xb-title">Перевод другу</div>
            <div className="xb-desc">По юзернейму или Telegram ID</div>

            <div className="xb-form">
              <div className="xb-field">
                <div className="xb-label">Получатель</div>
                <input
                  className="xb-input"
                  placeholder="@username или tgId"
                  inputMode="text"
                />
              </div>

              <div className="xb-field">
                <div className="xb-label">Сумма</div>
                <div className="xb-amount">
                  <input
                    className="xb-input xb-input-amount"
                    placeholder="0"
                    inputMode="numeric"
                  />
                  <div className="xb-suffix">💎</div>
                </div>
              </div>

              <button className="xb-action" onClick={() => {}}>
                Отправить
              </button>
            </div>
          </div>
        </div>

        <div className="exchange-block small">
          <div className="xb-title">Курс</div>
          <div className="xb-desc">В будущем можно будет обменивать кристаллы</div>

          <div className="xb-row">
            <div className="xb-pill">1 💎</div>
            <div className="xb-arrow">→</div>
            <div className="xb-pill">1 💎</div>
          </div>
        </div>

        <div className="exchange-block small">
          <div className="xb-title">История</div>
          <div className="xb-desc">Здесь появятся твои последние переводы</div>

          <div className="xb-empty">Пусто</div>
        </div>
      </div>
    </div>
  )
}
