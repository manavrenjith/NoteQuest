import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Leaderboard from '../components/Leaderboard'
import ThemeToggle from '../components/ThemeToggle'

function LeaderboardPage() {
  const navigate = useNavigate()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const closeDrawer = () => {
    setIsDrawerOpen(false)
  }

  return (
    <main style={{ background: 'var(--surface-0)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'color-mix(in srgb, var(--surface-0) 96%, transparent)',
          backdropFilter: 'blur(8px)',
          borderBottom: '0.5px solid var(--border-soft)',
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            padding: '0 1.5rem',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <button
            type="button"
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={isDrawerOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition"
            style={{ border: '0.5px solid var(--border-strong)', color: 'var(--text-muted)' }}
          >
            {isDrawerOpen ? '×' : '☰'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>NoteQuest</span>
          </button>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }} className="hidden md:flex">
            <button type="button" onClick={() => navigate('/dashboard')} style={{ fontSize: 13, color: 'var(--text-subtle)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Dashboard
            </button>
            <button type="button" onClick={() => navigate('/upload')} style={{ fontSize: 13, color: 'var(--text-subtle)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Upload notes
            </button>
            <button type="button" onClick={() => navigate('/settings')} style={{ fontSize: 13, color: 'var(--text-subtle)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Settings
            </button>
          </nav>

          <ThemeToggle />
        </div>
      </header>

      {isDrawerOpen ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeDrawer}
            className="fixed inset-0 z-40"
            style={{ background: 'color-mix(in srgb, var(--surface-0) 45%, transparent)' }}
          />

          <aside
            className="fixed left-0 top-0 z-50 h-full w-72 p-4"
            style={{ borderRight: '0.5px solid var(--border-soft)', background: 'var(--surface-1)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Menu</span>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close drawer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ border: '0.5px solid var(--border-strong)', color: 'var(--text-muted)' }}
              >
                ×
              </button>
            </div>

            <nav className="flex flex-col gap-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  closeDrawer()
                  navigate('/dashboard')
                }}
                className="rounded-lg px-3 py-2 text-left transition"
                style={{ border: '0.5px solid var(--border-strong)', color: 'var(--text-muted)' }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  closeDrawer()
                  navigate('/upload')
                }}
                className="rounded-lg px-3 py-2 text-left transition"
                style={{ border: '0.5px solid var(--border-strong)', color: 'var(--text-muted)' }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                Upload notes
              </button>
              <button
                type="button"
                onClick={() => {
                  closeDrawer()
                  navigate('/leaderboard')
                }}
                className="rounded-lg px-3 py-2 text-left"
                style={{
                  border: '0.5px solid var(--border-strong)',
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                }}
              >
                Leaderboard
              </button>
              <button
                type="button"
                onClick={() => {
                  closeDrawer()
                  navigate('/settings')
                }}
                className="rounded-lg px-3 py-2 text-left transition"
                style={{ border: '0.5px solid var(--border-strong)', color: 'var(--text-muted)' }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                Settings
              </button>
            </nav>
          </aside>
        </>
      ) : null}

      <section style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Leaderboard</h1>
          <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Track your rank and compare study momentum with others.</p>
        </div>

        <Leaderboard />
      </section>
    </main>
  )
}

export default LeaderboardPage
