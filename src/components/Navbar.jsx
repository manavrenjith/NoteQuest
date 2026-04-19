import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getLevel, getXP } from '../utils/storage'
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
  const rank = rankProp || getLevel(xp).title
  const username = localStorage.getItem('nq_username') || ''
  const initials = username.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?'

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
    border: '0.5px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.02)',
    padding: '10px 16px',
    textAlign: 'left',
    fontWeight: 600,
    color: 'rgba(241,245,249,1)',
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
            className="fixed inset-0 z-40 bg-black/50"
            onClick={closeSettings}
            aria-label="Close settings drawer overlay"
          />
          <aside
            id="settings-drawer"
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm border-l border-white/15 bg-black p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Additional settings"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Additional Settings</h2>
              <button
                type="button"
                onClick={closeSettings}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white"
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
                marginTop: 12,
                borderRadius: 12,
                border: '0.5px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.02)',
                padding: 12,
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,1)' }}>Theme</p>
              <div
                style={{
                  marginTop: 12,
                  display: 'inline-flex',
                  borderRadius: 12,
                  border: '0.5px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.02)',
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
                    background: theme === 'dark' ? 'rgba(127,119,221,1)' : 'transparent',
                    color: theme === 'dark' ? 'rgba(255,255,255,1)' : 'rgba(226,232,240,1)',
                    border: 'none',
                    cursor: 'pointer',
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
                    background: theme === 'light' ? 'rgba(127,119,221,1)' : 'transparent',
                    color: theme === 'light' ? 'rgba(255,255,255,1)' : 'rgba(226,232,240,1)',
                    border: 'none',
                    cursor: 'pointer',
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
                e.currentTarget.style.borderColor = 'rgba(127,119,221,0.8)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              }}
            >
              Go to Leaderboard
            </button>

            <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />

            <button
              type="button"
              onClick={() => {
                closeSettings()
                navigate('/profile')
              }}
              style={settingsActionButtonStyle}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(127,119,221,0.8)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(127,119,221,0.2)',
                    border: '0.5px solid rgba(127,119,221,0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 500,
                    color: 'rgba(175,169,236,1)',
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </span>
                <span>{username || 'View profile'}</span>
              </span>
            </button>
          </aside>
        </>
      )}
    </nav>
  )
}