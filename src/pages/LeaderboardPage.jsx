import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdditionalSettingsDrawer from '../components/AdditionalSettingsDrawer'
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
          <h1 className="text-3xl font-black text-white">Leaderboard</h1>
          <p className="mt-2 text-slate-300">Track your rank and compare study momentum with others.</p>
        </div>

        <Leaderboard />
      </section>

      <AdditionalSettingsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        theme={theme}
        setTheme={setTheme}
      />
    </main>
  )
}

export default LeaderboardPage
