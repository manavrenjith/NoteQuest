import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Leaderboard from '../components/Leaderboard'
import Navbar from '../components/Navbar'
import { applyTheme, getTheme, onThemeChange } from '../utils/theme'

function LeaderboardPage() {
  const navigate = useNavigate()
  const [theme, setTheme] = useState(() => getTheme())
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => onThemeChange(setTheme), [])

  return (
    <main style={{ background: 'var(--surface-0)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      <Navbar showSettingsHamburger onSettingsHamburgerClick={() => setDrawerOpen(true)} />

      <section style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Leaderboard</h1>
          <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Track your rank and compare study momentum with others.</p>
        </div>

        <Leaderboard />
      </section>

      {drawerOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close settings drawer overlay"
          />
          <aside
            id="settings-drawer"
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm border-l border-white/15 bg-[#0a0a0a] p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Additional settings"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Additional Settings</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
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
            <div className="mt-3 rounded-xl border border-white/15 bg-[#0d0d0d] p-3">
              <p className="text-sm font-semibold text-white">Theme</p>
              <div className="mt-3 inline-flex rounded-xl border border-[#888] bg-[#0d0d0d] p-1">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    theme === 'dark' ? 'bg-indigo-500 text-white' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    theme === 'light' ? 'bg-indigo-500 text-white' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  Light
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false)
                navigate('/leaderboard')
              }}
              className="mt-3 w-full rounded-xl border border-[#888] bg-[#0d0d0d] px-4 py-2.5 text-left font-semibold text-slate-100 transition hover:border-indigo-400"
            >
              Go to Leaderboard
            </button>
          </aside>
        </>
      )}
    </main>
  )
}

export default LeaderboardPage
