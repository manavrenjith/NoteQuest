import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getLevel, getXP, getStreak, getSubjects } from '../utils/storage'
import { applyTheme, getTheme, onThemeChange } from '../utils/theme'

const appLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'My notes', path: '/notes' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Settings', path: '/settings' },
]

export default function Navbar({
  xp: xpProp,
  rank: rankProp,
  showSettingsHamburger = true,
  showXpPill = false,
  onSettingsHamburgerClick,
}) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [theme, setTheme] = useState(() => getTheme())
  const xp = Number.isFinite(xpProp) ? xpProp : getXP()
  const streak = getStreak()
  const subjects = getSubjects()
  const rank = rankProp || getLevel(xp).title
  const username = localStorage.getItem('nq_username') || ''
  const initials = username.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?'
  const allTopics = subjects.flatMap(subject => subject.chapters?.flatMap(chapter => chapter.topics) ?? [])
  const completedTopics = allTopics.filter(topic => topic.completed).length

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => onThemeChange(setTheme), [])

  // Home route uses marketing links; app routes use navigation links.
  const isLanding = pathname === '/'
  const closeSettings = () => setDrawerOpen(false)
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

  const handleSettingsHamburgerClick = () => {
    if (onSettingsHamburgerClick) {
      onSettingsHamburgerClick()
      return
    }

    setDrawerOpen(true)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 rounded-md px-1 py-1 text-white transition hover:bg-white/5"
          aria-label="Go to home"
        >
          <span className="h-2 w-2 rounded-full bg-indigo-400" />
          <span className="text-sm font-semibold tracking-wide">NoteQuest</span>
        </button>

        <div className="flex items-center gap-1">
          {isLanding ? (
            <>
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                How it works
              </button>
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Features
              </button>
              <div className="mx-1 h-4 w-px bg-white/15" />
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/5"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate('/upload')}
                className="rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-400"
              >
                Get started
              </button>
            </>
          ) : (
            <>
              {appLinks.map(({ label, path }) => {
                const active = pathname === path
                return (
                  <button
                    key={path}
                    type="button"
                    className={
                      'rounded-md px-3 py-1.5 text-xs font-medium transition ' +
                      (active
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white')
                    }
                    onClick={() => navigate(path)}
                  >
                    {label}
                  </button>
                )
              })}
              {showXpPill && (
                <>
                  <div className="mx-1 h-4 w-px bg-white/15" />
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    <span className="font-semibold text-white">{xp} XP</span>
                    <span>· {rank}</span>
                  </div>
                </>
              )}

              <div className="mx-1 h-4 w-px bg-white/15" />
              <button
                type="button"
                onClick={() => navigate('/profile')}
                title="View profile"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'rgba(127,119,221,0.2)',
                  border: '0.5px solid rgba(127,119,221,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'rgba(175,169,236,1)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(127,119,221,0.35)'
                  e.currentTarget.style.borderColor = 'rgba(127,119,221,0.6)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(127,119,221,0.2)'
                  e.currentTarget.style.borderColor = 'rgba(127,119,221,0.35)'
                }}
              >
                {initials}
              </button>
            </>
          )}

          {showSettingsHamburger && (
            <>
              <div className="mx-1 h-4 w-px bg-white/15" />
              <button
                type="button"
                onClick={handleSettingsHamburgerClick}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-slate-200 transition hover:bg-white/10 hover:text-white"
                aria-label="Open settings drawer"
                aria-controls={onSettingsHamburgerClick ? 'settings-drawer' : undefined}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {drawerOpen && !onSettingsHamburgerClick && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={closeSettings}
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
                onClick={closeSettings}
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
                closeSettings()
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

            <div style={{ height: '0.5px', background: 'var(--border-soft)', margin: '8px 0' }} />

            <button
              type="button"
              onClick={() => {
                closeSettings()
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
          </aside>
        </>
      )}
    </nav>
  )
}