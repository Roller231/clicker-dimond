import './Tasks.css'

type Props = {
  balance: number
}

type TaskItem = {
  id: string
  title: string
  desc: string
  reward: number
  statusLabel: string
}

export default function Tasks({ balance }: Props) {
  const daily: TaskItem[] = [
    {
      id: 'd1',
      title: 'Сделать 50 кликов',
      desc: 'Кликай по алмазу 50 раз',
      reward: 50,
      statusLabel: 'В процессе',
    },
    {
      id: 'd2',
      title: 'Собрать 300 💎',
      desc: 'Накопи 300 кристаллов',
      reward: 75,
      statusLabel: 'Не начато',
    },
    {
      id: 'd3',
      title: 'Купить 1 улучшение',
      desc: 'Зайди в улучшения и купи любой апгрейд',
      reward: 100,
      statusLabel: 'Не начато',
    },
  ]

  const weekly: TaskItem[] = [
    {
      id: 'w1',
      title: 'Сделать 1000 кликов',
      desc: 'Набери 1000 кликов за неделю',
      reward: 500,
      statusLabel: 'В процессе',
    },
    {
      id: 'w2',
      title: 'Накопить 10 000 💎',
      desc: 'Собери большую сумму кристаллов',
      reward: 800,
      statusLabel: 'Не начато',
    },
  ]

  return (
    <div className="tasks-page page-with-particles">
      <div className="page-particles" />
      <div className="tasks-header">
        <div className="tasks-title">Задания</div>

        <div className="tasks-balance">
          <span className="tb-emoji">💎</span>
          <span className="tb-value">{balance}</span>
        </div>
      </div>

      <div className="tasks-list">
        <div className="tasks-section">
          <div className="ts-head">
            <div className="ts-title">Ежедневные</div>
            <div className="ts-sub">Обновляются каждый день</div>
          </div>

          <div className="ts-items">
            {daily.map((t) => (
              <div className="task-card" key={t.id}>
                <div className="tc-left">
                  <div className="tc-title">{t.title}</div>
                  <div className="tc-desc">{t.desc}</div>

                  <div className="tc-meta">
                    <span className="tc-reward">+{t.reward} 💎</span>
                  </div>
                </div>

                <button className="tc-action" onClick={() => {}}>
                  Забрать
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="tasks-section">
          <div className="ts-head">
            <div className="ts-title">Еженедельные</div>
            <div className="ts-sub">Обновляются раз в неделю</div>
          </div>

          <div className="ts-items">
            {weekly.map((t) => (
              <div className="task-card" key={t.id}>
                <div className="tc-left">
                  <div className="tc-title">{t.title}</div>
                  <div className="tc-desc">{t.desc}</div>

                  <div className="tc-meta">
                    <span className="tc-reward">+{t.reward} 💎</span>
                  </div>
                </div>

                <button className="tc-action" onClick={() => {}}>
                  Забрать
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
