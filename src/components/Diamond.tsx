import './Diamond.css'

type Props = {
  onClick: () => void
}

export default function Diamond({ onClick }: Props) {
  return (
    <div className="diamond-wrapper">
      <button className="diamond-button" onClick={onClick}>
        <img
          src="/crystal.png"
          alt="Crystal"
          className="diamond-img"
          draggable={false}
        />
      </button>
      <div className="tap-label">TAP</div>
    </div>
  )
}
