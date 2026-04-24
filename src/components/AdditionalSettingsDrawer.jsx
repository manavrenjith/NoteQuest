import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLevel, getStreak, getSubjects, getXP } from '../utils/storage'

export default function AdditionalSettingsDrawer({ open, onClose }) {
  const navigate = useNavigate()
  const ANIMATION_MS = 280
  const [isMounted, setIsMounted] = useState(open)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let timeoutId

    if (open) {
      setIsMounted(true)
    } else if (isMounted) {
      setIsVisible(false)
      timeoutId = setTimeout(() => setIsMounted(false), ANIMATION_MS)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [open, isMounted])

  useEffect(() => {
    if (!isMounted || !open) return undefined

    // Wait one frame so the hidden state is painted before transitioning in.
    const frameId = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(frameId)
  }, [isMounted, open])

  if (!isMounted) {
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
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.45)',
          opacity: isVisible ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onClose}
        aria-label="Close settings drawer overlay"
      />
      <aside
        id="settings-drawer"
        className={
          'fixed left-0 top-0 z-50 h-full w-full max-w-sm p-5 shadow-2xl transform-gpu transition-all duration-300 ease-out ' +
          (isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0')
        }
        style={{
          borderRight: '0.5px solid var(--border-strong)',
          background: 'var(--surface-0)',
          color: 'var(--text-primary)',
          boxShadow: '10px 0 30px rgba(0,0,0,0.16)',
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

        <button
          type="button"
          onClick={() => {
            onClose()
            navigate('/profile')
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
          About Me
        </button>

        <button
          type="button"
          onClick={() => {
            onClose()
            navigate('/leaderboard')
          }}
          style={{ ...settingsActionButtonStyle, marginTop: 10 }}
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
