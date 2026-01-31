import './BottomNav.css'

type Page = 'home' | 'upgrades' | 'shop' | 'exchange' | 'tasks'

type Props = {
  active: Page
  onChange: (page: Page) => void
}

export default function BottomNav({ active, onChange }: Props) {
  return (
    <div className="bottom-nav">
      <NavItem
        emoji="⚙️"
        label="Улучшения"
        active={active === 'upgrades'}
        onClick={() => onChange('upgrades')}
      />

      <NavItem
        emoji="🛒"
        label="Магазин"
        active={active === 'shop'}
        onClick={() => onChange('shop')}
      />

      {/* ГЛАВНАЯ */}
      <NavItem
        emoji="💎"
        label="Главная"
        active={active === 'home'}
        center
        onClick={() => onChange('home')}
      />

      <NavItem
        emoji="🔁"
        label="Обмен"
        active={active === 'exchange'}
        onClick={() => onChange('exchange')}
      />

      <NavItem
        emoji="📋"
        label="Задания"
        active={active === 'tasks'}
        onClick={() => onChange('tasks')}
      />
    </div>
  )
}

type NavItemProps = {
  emoji: string
  label: string
  active?: boolean
  center?: boolean
  onClick?: () => void
}

function NavItem({ emoji, label, active, center, onClick }: NavItemProps) {
  return (
    <div
      className={`nav-item ${active ? 'active' : ''} ${
        center ? 'center' : ''
      }`}
      onClick={onClick}
    >
      <div className="nav-emoji">{emoji}</div>
      <div className="nav-label">{label}</div>
    </div>
  )
}
