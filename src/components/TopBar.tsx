import './TopBar.css'


type Props = {
  balance: number
}

export default function TopBar({ balance }: Props) {
  return (
    <div className="top-bar">
      <div className="top-balance">
        <span className="top-icon">💎</span>
        <span className="top-amount">{balance}</span>
      </div>
    </div>
  )
}
