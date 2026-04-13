import { useState } from 'react'

export default function RatingPrompt({ onRate, onSkip }) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)

  const labels = ['', 'Easy', 'Medium', 'Hard']
  const bonusXP = [0, 0, 5, 15]

  const handleSelect = (rating) => {
    setSelected(rating)
    window.setTimeout(() => onRate(rating), 300)
  }

  return (
    <div
      style={{
        background: 'var(--color-background-secondary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 10,
        padding: '10px 12px',
        marginTop: 6,
        marginLeft: 22,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: 'var(--color-text-secondary)',
          marginBottom: 8,
        }}
      >
        How difficult was this topic?
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3].map((star) => (
            <div
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => handleSelect(star)}
              style={{
                fontSize: 18,
                cursor: 'pointer',
                transition: 'transform 0.1s',
                transform: hovered >= star || selected >= star ? 'scale(1.2)' : 'scale(1)',
                opacity: hovered >= star || selected >= star ? 1 : 0.3,
                filter: hovered >= star || selected >= star ? 'none' : 'grayscale(1)',
              }}
            >
              ⭐
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12 }}>
          {hovered || selected ? (
            <span>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{labels[hovered || selected]}</span>
              {bonusXP[hovered || selected] > 0 ? (
                <span style={{ color: '#7F77DD', marginLeft: 6 }}>+{bonusXP[hovered || selected]} bonus XP</span>
              ) : null}
            </span>
          ) : (
            <span style={{ color: 'var(--color-text-secondary)' }}>Rate difficulty</span>
          )}
        </div>

        <button
          type="button"
          onClick={onSkip}
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: 'var(--color-text-secondary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          skip
        </button>
      </div>
    </div>
  )
}
