import { useEffect } from 'react'
import './Tasks.css'
import { useUser } from '../context/UserContext'

type Props = {
  balance: number
}

export default function Tasks({ balance }: Props) {
  const { tasks, handleClaimTask, refreshTasks } = useUser()

  // Обновляем задания при заходе на страницу
  useEffect(() => {
    refreshTasks()
  }, [refreshTasks])

  const daily = tasks.filter(t => t.taskType === 'daily')
  const weekly = tasks.filter(t => t.taskType === 'weekly')

  const handleClaim = async (taskId: number) => {
    const success = await handleClaimTask(taskId)
    if (success) {
      await refreshTasks()
    }
  }

  const renderTaskCard = (t: typeof tasks[0]) => {
    const canClaim = t.isCompleted && !t.isClaimed
    const progressPercent = Math.min(100, Math.round((t.progress / t.targetValue) * 100))

    return (
      <div className="task-card" key={t.taskId}>
        <div className="tc-left">
          <div className="tc-title">{t.title}</div>
          <div className="tc-desc">{t.description}</div>

          <div className="tc-meta">
            <span className="tc-reward">+{t.reward} 💎</span>
            <span className="tc-progress">{t.progress}/{t.targetValue} ({progressPercent}%)</span>
          </div>
        </div>

        <button
          className={`tc-action ${canClaim ? '' : 'disabled'}`}
          onClick={() => canClaim && handleClaim(t.taskId)}
          disabled={!canClaim}
        >
          {t.isClaimed ? '✓' : canClaim ? 'Забрать' : `${progressPercent}%`}
        </button>
      </div>
    )
  }

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
            {daily.length > 0 ? daily.map(renderTaskCard) : (
              <div className="tasks-empty">Нет заданий</div>
            )}
          </div>
        </div>

        <div className="tasks-section">
          <div className="ts-head">
            <div className="ts-title">Еженедельные</div>
            <div className="ts-sub">Обновляются раз в неделю</div>
          </div>

          <div className="ts-items">
            {weekly.length > 0 ? weekly.map(renderTaskCard) : (
              <div className="tasks-empty">Нет заданий</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
