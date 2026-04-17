import Leaderboard from '../components/Leaderboard'
import Navbar from '../components/Navbar'

function LeaderboardPage() {
  return (
    <main style={{ background: 'var(--surface-0)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      <Navbar />

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
