import { useNavigate } from 'react-router-dom'
import Leaderboard from '../components/Leaderboard'
import ThemeToggle from '../components/ThemeToggle'

function LeaderboardPage() {
  const navigate = useNavigate()

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
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>NoteQuest</span>
          </button>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
            <button type="button" onClick={() => navigate('/dashboard')} style={{ fontSize: 13, color: 'var(--text-subtle)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Dashboard
            </button>
            <button type="button" onClick={() => navigate('/upload')} style={{ fontSize: 13, color: 'var(--text-subtle)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Upload notes
            </button>
            <button type="button" onClick={() => navigate('/leaderboard')} style={{ fontSize: 13, color: 'var(--text-primary)', background: 'var(--surface-2)', border: '0.5px solid var(--border-soft)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
              Leaderboard
            </button>
            <button type="button" onClick={() => navigate('/settings')} style={{ fontSize: 13, color: 'var(--text-subtle)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Settings
            </button>
          </nav>

          <ThemeToggle />
        </div>
      </header>

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
