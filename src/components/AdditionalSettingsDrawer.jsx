import { useNavigate } from 'react-router-dom'
import { getLevel, getStreak, getSubjects, getXP } from '../utils/storage'

export default function AdditionalSettingsDrawer({ open, onClose, theme, setTheme }) {
  const navigate = useNavigate()

  if (!open) {
    return null
  }

  const xp = getXP()
  const streak = getStreak()
  const subjects = getSubjects()
  const rank = getLevel(xp).title
  const username = localStorage.getItem('nq_username') || ''
  const initials = username.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?'
  const allTopics = subjects.flatMap(subject => subject.chapters?.flatMap(chapter => chapter.topics) ?? [])
  const completedTopics = allTopics.filter(topic => topic.completed).length

  const settingsActionButtonStyle = {
    width: '100%',
    borderRadius: 12,
    border: '0.5px solid var(--border-strong)',
    background: 'var(--surface-1)',
    padding: '10px 16px',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: 14,
    color: 'var(--text-primary)',
    transition: 'all 0.15s',
    cursor: 'pointer',
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.45)' }}
        onClick={onClose}
        aria-label="Close settings drawer overlay"
      />
      <aside
        id="settings-drawer"
        className="fixed right-0 top-0 z-50 h-full w-full max-w-sm p-5 shadow-2xl"
        style={{
          borderLeft: '0.5px solid var(--border-strong)',
          background: 'var(--surface-0)',
          color: 'var(--text-primary)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.16)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Additional settings"
      >
        <div className="flex items-center justify-between">
          <h2 style={{ fontSize: 38, fontWeight: 600, lineHeight: 1.1, color: 'var(--text-primary)' }}>Additional Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md transition"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--surface-3)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
            aria-label="Close settings drawer"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose()
            navigate('/profile')
          }}
          style={{
            ...settingsActionButtonStyle,
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.background = 'var(--surface-2)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-strong)'
            e.currentTarget.style.background = 'var(--surface-1)'
          }}
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(127,119,221,0.2)',
              border: '0.5px solid rgba(127,119,221,0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 500,
              color: 'rgba(175,169,236,1)',
              flexShrink: 0,
              letterSpacing: 0.6,
            }}
          >
            {initials}
          </span>

          <span style={{ minWidth: 0, textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.15 }}>
                {username || 'Anonymous'}
              </span>
            </span>
            <span style={{ marginTop: 2, display: 'block', fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.25 }}>
              {rank} · {completedTopics} topics · {streak}d streak
            </span>
          </span>
        </button>

        <div
          style={{
            marginTop: 14,
            borderRadius: 12,
            border: '0.5px solid var(--border-strong)',
            background: 'var(--surface-1)',
            padding: 14,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Theme</p>
          <div
            style={{
              marginTop: 12,
              display: 'inline-flex',
              borderRadius: 12,
              border: '0.5px solid var(--border-strong)',
              background: 'var(--surface-2)',
              padding: 4,
            }}
          >
            <button
              type="button"
              onClick={() => setTheme('dark')}
              style={{
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.15s',
                background: theme === 'dark' ? 'var(--accent)' : 'transparent',
                color: theme === 'dark' ? 'rgba(255,255,255,1)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                minWidth: 52,
              }}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              style={{
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.15s',
                background: theme === 'light' ? 'var(--accent)' : 'transparent',
                color: theme === 'light' ? 'rgba(255,255,255,1)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                minWidth: 52,
              }}
            >
              Light
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose()
            navigate('/leaderboard')
          }}
          style={{ ...settingsActionButtonStyle, marginTop: 12 }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.background = 'var(--surface-2)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-strong)'
            e.currentTarget.style.background = 'var(--surface-1)'
          }}
        >
          Go to Leaderboard
        </button>
      </aside>
    </>
  )
}
